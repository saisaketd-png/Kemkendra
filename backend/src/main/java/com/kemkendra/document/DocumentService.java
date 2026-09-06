package com.kemkendra.document;

import com.kemkendra.admin.audit.AuditAction;
import com.kemkendra.admin.audit.AuditService;
import com.kemkendra.admin.audit.AuditTargetType;
import com.kemkendra.admin.config.PlatformPolicyService;
import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.document.storage.StorageService;
import com.kemkendra.document.dto.DocumentComplianceStatsDto;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.notification.events.DocumentApprovedEvent;
import com.kemkendra.notification.events.DocumentExpiredEvent;
import com.kemkendra.notification.events.DocumentNearingExpiryEvent;
import com.kemkendra.notification.events.DocumentRejectedEvent;
import com.kemkendra.notification.events.DocumentUploadedEvent;
import com.kemkendra.product.ProductService;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final ProductService productService;
    private final ApplicationEventPublisher eventPublisher;
    private final FileSecurityValidator fileSecurityValidator;
    private final PlatformPolicyService platformPolicyService;
    private final AuditService auditService;
    private final UserRepository userRepository;
    private final long defaultMaxFileSize;

    public DocumentService(DocumentRepository documentRepository,
                           StorageService storageService,
                           ProductService productService,
                           ApplicationEventPublisher eventPublisher,
                           FileSecurityValidator fileSecurityValidator,
                           PlatformPolicyService platformPolicyService,
                           AuditService auditService,
                           UserRepository userRepository,
                           @Value("${kemkendra.documents.max-file-size:10485760}") long defaultMaxFileSize) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.productService = productService;
        this.eventPublisher = eventPublisher;
        this.fileSecurityValidator = fileSecurityValidator;
        this.platformPolicyService = platformPolicyService;
        this.auditService = auditService;
        this.userRepository = userRepository;
        this.defaultMaxFileSize = defaultMaxFileSize;
    }

    private long resolveMaxFileSize() {
        try {
            int maxMb = platformPolicyService.getIntSetting("MAX_DOCUMENT_SIZE_MB", (int) (defaultMaxFileSize / (1024 * 1024)));
            return (long) maxMb * 1024 * 1024;
        } catch (Exception e) {
            return defaultMaxFileSize;
        }
    }

    @Transactional
    public DocumentResponse uploadDocument(DocumentUploadRequest request, UUID uploadedBy) {
        MultipartFile file = request.getFile();
        validateAllowedCategories(request.getOwnerType(), request.getCategory());

        long effectiveMaxSize = resolveMaxFileSize();
        FileSecurityValidator.ValidatedFileInfo validated = fileSecurityValidator.validate(file, effectiveMaxSize);

        String storageKey = "documents/" + UUID.randomUUID() + validated.safeExtension();

        // 1. Store physical file in storage
        try {
            storageService.store(storageKey, file.getInputStream());
        } catch (IOException e) {
            throw new RuntimeException("Failed to read upload stream", e);
        }

        // 2. Lineage and version resolution
        UUID documentGroupId;
        int nextVersion = 1;
        Document previousActive = null;

        if (request.getDocumentGroupId() != null) {
            // Verify lineage exists and matches owner
            List<Document> existingGroup = documentRepository.findByDocumentGroupIdOrderByVersionDesc(request.getDocumentGroupId());
            if (existingGroup.isEmpty()) {
                throw new IllegalArgumentException("Specified document lineage group not found: " + request.getDocumentGroupId());
            }
            Document head = existingGroup.get(0);
            if (head.getOwnerType() != request.getOwnerType() || !head.getOwnerId().equals(request.getOwnerId())) {
                throw new IllegalArgumentException("Document lineage does not match specified owner");
            }
            documentGroupId = request.getDocumentGroupId();
            nextVersion = head.getVersion() != null ? head.getVersion() + 1 : existingGroup.size() + 1;

            // Mark previous active document in this lineage as replaced (isActive = false, status = REPLACED)
            for (Document d : existingGroup) {
                if (Boolean.TRUE.equals(d.getIsActive())) {
                    previousActive = d;
                    d.setIsActive(false);
                    d.setStatus(DocumentStatus.REPLACED);
                    documentRepository.save(d);
                }
            }
        } else {
            // Start a new independent document lineage
            documentGroupId = UUID.randomUUID();
        }

        // Determine initial status: Admin uploads (e.g. MasterProduct specs) are APPROVED, others are PENDING_REVIEW
        User uploader = userRepository.findById(uploadedBy).orElse(null);
        boolean isAdmin = uploader != null && UserRole.ADMIN == uploader.getRole();
        DocumentStatus initialStatus = isAdmin ? DocumentStatus.APPROVED : DocumentStatus.PENDING_REVIEW;

        String resolvedTitle = (request.getTitle() != null && !request.getTitle().isBlank())
                ? request.getTitle().trim()
                : validated.safeOriginalFilename();

        boolean isPublic = Boolean.TRUE.equals(request.getIsPublic());
        if (request.getOwnerType() == DocumentOwnerType.PRODUCT || request.getOwnerType() == DocumentOwnerType.MASTER_PRODUCT) {
            isPublic = true;
        }

        // 3. Persist Database Metadata
        Document doc = new Document();
        doc.setDocumentGroupId(documentGroupId);
        doc.setOwnerType(request.getOwnerType());
        doc.setOwnerId(request.getOwnerId());
        doc.setCategory(request.getCategory());
        doc.setTitle(resolvedTitle);
        doc.setIsPublic(isPublic);
        doc.setOriginalFileName(validated.safeOriginalFilename());
        doc.setStorageKey(storageKey);
        doc.setMimeType(validated.validatedMimeType());
        doc.setFileSize(validated.fileSize());
        doc.setUploadedBy(uploadedBy);
        doc.setDocumentNumber(request.getDocumentNumber());
        doc.setIssuingAuthority(request.getIssuingAuthority());
        doc.setIssueDate(request.getIssueDate());
        doc.setExpiryDate(request.getExpiryDate());
        doc.setStatus(initialStatus);
        doc.setVersion(nextVersion);
        doc.setChecksum(validated.checksum());
        doc.setDescription(request.getDescription());
        doc.setIsActive(true);

        try {
            doc = documentRepository.saveAndFlush(doc);
        } catch (Exception ex) {
            // Rollback storage if database fails
            storageService.delete(storageKey);
            throw ex;
        }

        if (previousActive != null) {
            previousActive.setReplacedById(doc.getId());
            documentRepository.saveAndFlush(previousActive);
        }

        if (doc.getOwnerType() == DocumentOwnerType.PRODUCT) {
            productService.updateDocumentAvailability(doc.getOwnerId(), doc.getCategory(), true);
        }

        // 4. Audit & Event Integration
        AuditAction auditAction = nextVersion > 1 ? AuditAction.DOCUMENT_VERSION_CREATED : AuditAction.DOCUMENT_UPLOADED;
        recordDocumentAudit(uploadedBy, auditAction, doc.getId().toString(),
                "Uploaded " + doc.getCategory() + " (V" + doc.getVersion() + "): " + doc.getOriginalFileName());

        eventPublisher.publishEvent(new DocumentUploadedEvent(
                doc.getId(),
                doc.getOwnerType(),
                doc.getOwnerId(),
                doc.getCategory(),
                doc.getUploadedBy()
        ));

        return new DocumentResponse(doc);
    }

    private void validateAllowedCategories(DocumentOwnerType ownerType, DocumentCategory category) {
        if (ownerType == DocumentOwnerType.PRODUCT || ownerType == DocumentOwnerType.MASTER_PRODUCT || ownerType == DocumentOwnerType.SUPPLIER_OFFERING) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.COA,
                    DocumentCategory.CERTIFICATE_OF_ANALYSIS,
                    DocumentCategory.MSDS,
                    DocumentCategory.SAFETY_DATA_SHEET,
                    DocumentCategory.TECHNICAL_SPECIFICATION,
                    DocumentCategory.TECHNICAL_DATA_SHEET,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.QUALITY_CERTIFICATE,
                    DocumentCategory.SAFETY_CERTIFICATE,
                    DocumentCategory.GMP_CERTIFICATE,
                    DocumentCategory.CGMP_CERTIFICATE,
                    DocumentCategory.ISO_CERTIFICATE,
                    DocumentCategory.EXPORT_CERTIFICATE,
                    DocumentCategory.MANUFACTURING_LICENSE,
                    DocumentCategory.REACH_COMPLIANCE,
                    DocumentCategory.HALAL_CERTIFICATE,
                    DocumentCategory.KOSHER_CERTIFICATE,
                    DocumentCategory.REGULATORY_CERTIFICATE,
                    DocumentCategory.PURITY_CERTIFICATE,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for " + ownerType + ": " + category);
            }
        } else if (ownerType == DocumentOwnerType.SUPPLIER) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.BUSINESS_REGISTRATION,
                    DocumentCategory.COMPANY_REGISTRATION,
                    DocumentCategory.TAX_REGISTRATION,
                    DocumentCategory.TAX_CERTIFICATE,
                    DocumentCategory.GST_CERTIFICATE,
                    DocumentCategory.PAN_CARD,
                    DocumentCategory.COMPANY_LICENSE,
                    DocumentCategory.BUSINESS_LICENSE,
                    DocumentCategory.DRUG_LICENSE,
                    DocumentCategory.FACTORY_LICENSE,
                    DocumentCategory.POLLUTION_CLEARANCE,
                    DocumentCategory.QUALITY_CERTIFICATE,
                    DocumentCategory.SAFETY_CERTIFICATE,
                    DocumentCategory.CERTIFICATE_OF_ANALYSIS,
                    DocumentCategory.COA,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.TECHNICAL_SPECIFICATION,
                    DocumentCategory.TECHNICAL_DATA_SHEET,
                    DocumentCategory.MSDS,
                    DocumentCategory.SAFETY_DATA_SHEET,
                    DocumentCategory.GMP_CERTIFICATE,
                    DocumentCategory.CGMP_CERTIFICATE,
                    DocumentCategory.ISO_CERTIFICATE,
                    DocumentCategory.EXPORT_CERTIFICATE,
                    DocumentCategory.MANUFACTURING_LICENSE,
                    DocumentCategory.REACH_COMPLIANCE,
                    DocumentCategory.HALAL_CERTIFICATE,
                    DocumentCategory.KOSHER_CERTIFICATE,
                    DocumentCategory.COMMERCIAL_INVOICE,
                    DocumentCategory.PACKING_LIST,
                    DocumentCategory.PURCHASE_ORDER,
                    DocumentCategory.RFQ_ATTACHMENT,
                    DocumentCategory.QUOTATION_ATTACHMENT,
                    DocumentCategory.DELIVERY_CONFIRMATION,
                    DocumentCategory.REGULATORY_CERTIFICATE,
                    DocumentCategory.SUPPLIER_AUTHORIZATION_DOCUMENT,
                    DocumentCategory.PURITY_CERTIFICATE,
                    DocumentCategory.OTHER_COMPLIANCE,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for SUPPLIER: " + category);
            }
        } else if (ownerType == DocumentOwnerType.RFQ) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.RFQ_ATTACHMENT,
                    DocumentCategory.TECHNICAL_SPECIFICATION,
                    DocumentCategory.TECHNICAL_DATA_SHEET,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.COA,
                    DocumentCategory.CERTIFICATE_OF_ANALYSIS,
                    DocumentCategory.MSDS,
                    DocumentCategory.SAFETY_DATA_SHEET,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for RFQ: " + category);
            }
        } else if (ownerType == DocumentOwnerType.QUOTATION) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.QUOTATION_ATTACHMENT,
                    DocumentCategory.TECHNICAL_SPECIFICATION,
                    DocumentCategory.TECHNICAL_DATA_SHEET,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.COA,
                    DocumentCategory.CERTIFICATE_OF_ANALYSIS,
                    DocumentCategory.MSDS,
                    DocumentCategory.SAFETY_DATA_SHEET,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for QUOTATION: " + category);
            }
        } else if (ownerType == DocumentOwnerType.PURCHASE_ORDER) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.PURCHASE_ORDER,
                    DocumentCategory.INVOICE,
                    DocumentCategory.COMMERCIAL_INVOICE,
                    DocumentCategory.INVOICE_REFERENCE,
                    DocumentCategory.PACKING_LIST,
                    DocumentCategory.TECHNICAL_SPECIFICATION,
                    DocumentCategory.TECHNICAL_DATA_SHEET,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.DELIVERY_DOCUMENT,
                    DocumentCategory.DELIVERY_CONFIRMATION,
                    DocumentCategory.RECEIPT_DOCUMENT,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for PURCHASE_ORDER: " + category);
            }
        } else if (ownerType == DocumentOwnerType.SHIPMENT) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.PACKING_LIST,
                    DocumentCategory.DELIVERY_CONFIRMATION,
                    DocumentCategory.DELIVERY_DOCUMENT,
                    DocumentCategory.RECEIPT_DOCUMENT,
                    DocumentCategory.SHIPPING_DOCUMENT,
                    DocumentCategory.SHIPMENT_DOCUMENT,
                    DocumentCategory.CERTIFICATION,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for SHIPMENT: " + category);
            }
        } else if (ownerType == DocumentOwnerType.INVOICE) {
            Set<DocumentCategory> allowed = Set.of(
                    DocumentCategory.INVOICE,
                    DocumentCategory.COMMERCIAL_INVOICE,
                    DocumentCategory.INVOICE_REFERENCE,
                    DocumentCategory.TAX_CERTIFICATE,
                    DocumentCategory.GST_CERTIFICATE,
                    DocumentCategory.OTHER
            );
            if (!allowed.contains(category)) {
                throw new IllegalArgumentException("Invalid category for INVOICE: " + category);
            }
        }
    }

    public DocumentResponse getDocument(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        return new DocumentResponse(doc);
    }

    public List<DocumentResponse> getDocumentsByOwner(DocumentOwnerType ownerType, UUID ownerId) {
        return getDocumentsByOwner(ownerType, ownerId, false);
    }

    public List<DocumentResponse> getDocumentsByOwner(DocumentOwnerType ownerType, UUID ownerId, boolean includeHistory) {
        List<Document> docs = includeHistory
                ? documentRepository.findByOwnerTypeAndOwnerId(ownerType, ownerId)
                : documentRepository.findByOwnerTypeAndOwnerIdAndIsActiveTrue(ownerType, ownerId);

        return docs.stream()
                .map(DocumentResponse::new)
                .collect(Collectors.toList());
    }

    public List<DocumentResponse> getDocumentVersions(UUID documentGroupId) {
        if (documentGroupId == null) {
            return Collections.emptyList();
        }
        return documentRepository.findByDocumentGroupIdOrderByVersionDesc(documentGroupId)
                .stream()
                .map(DocumentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivateDocument(UUID id, UUID actorId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        doc.setIsActive(false);
        documentRepository.saveAndFlush(doc);

        if (doc.getOwnerType() == DocumentOwnerType.PRODUCT) {
            boolean hasRemaining = documentRepository.findByOwnerTypeAndOwnerIdAndCategoryAndIsActiveTrue(
                    DocumentOwnerType.PRODUCT, doc.getOwnerId(), doc.getCategory()).size() > 0;
            if (!hasRemaining) {
                productService.updateDocumentAvailability(doc.getOwnerId(), doc.getCategory(), false);
            }
        }

        recordDocumentAudit(actorId, AuditAction.DOCUMENT_DEACTIVATED, doc.getId().toString(),
                "Deactivated document " + doc.getOriginalFileName() + " (V" + doc.getVersion() + ")");
    }

    @Transactional
    public void deleteDocument(UUID id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        // 1. Delete from DB first
        documentRepository.delete(doc);
        documentRepository.flush();

        if (doc.getOwnerType() == DocumentOwnerType.PRODUCT) {
            boolean hasRemaining = documentRepository.findByOwnerTypeAndOwnerId(DocumentOwnerType.PRODUCT, doc.getOwnerId())
                    .stream()
                    .anyMatch(d -> d.getCategory() == doc.getCategory());
            if (!hasRemaining) {
                productService.updateDocumentAvailability(doc.getOwnerId(), doc.getCategory(), false);
            }
        }

        // 2. Delete physical storage
        try {
            if (storageService.exists(doc.getStorageKey())) {
                storageService.delete(doc.getStorageKey());
            }
        } catch (Exception e) {
            throw new IllegalStateException("Failed to delete physical file", e);
        }
    }

    public Resource downloadDocument(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        if (!storageService.exists(document.getStorageKey())) {
            throw new ResourceNotFoundException("Document file not found on storage");
        }
        return storageService.loadAsResource(document.getStorageKey());
    }

    @Transactional
    public DocumentResponse approveDocument(UUID id, UUID adminId, String reviewNotes) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        doc.setStatus(DocumentStatus.APPROVED);
        doc.setReviewedBy(adminId);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setReviewNotes(reviewNotes != null ? reviewNotes.trim() : null);

        Document saved = documentRepository.saveAndFlush(doc);

        recordDocumentAudit(adminId, AuditAction.DOCUMENT_APPROVED, saved.getId().toString(),
                "Approved " + saved.getCategory() + " (" + saved.getTitle() + ")");

        eventPublisher.publishEvent(new DocumentApprovedEvent(
                saved.getId(),
                saved.getOwnerId(),
                saved.getOwnerType(),
                saved.getCategory(),
                saved.getUploadedBy(),
                adminId,
                reviewNotes
        ));

        return new DocumentResponse(saved);
    }

    @Transactional
    public DocumentResponse rejectDocument(UUID id, UUID adminId, String rejectionReason) {
        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }

        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        doc.setStatus(DocumentStatus.REJECTED);
        doc.setReviewedBy(adminId);
        doc.setReviewedAt(LocalDateTime.now());
        doc.setReviewNotes(rejectionReason.trim());

        Document saved = documentRepository.saveAndFlush(doc);

        recordDocumentAudit(adminId, AuditAction.DOCUMENT_REJECTED, saved.getId().toString(),
                "Rejected " + saved.getCategory() + " (" + saved.getTitle() + "). Reason: " + rejectionReason);

        eventPublisher.publishEvent(new DocumentRejectedEvent(
                saved.getId(),
                saved.getOwnerId(),
                saved.getOwnerType(),
                saved.getCategory(),
                saved.getUploadedBy(),
                adminId,
                rejectionReason.trim()
        ));

        return new DocumentResponse(saved);
    }

    @Transactional
    public DocumentResponse expireDocument(UUID id, UUID adminId, String reason) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        doc.setStatus(DocumentStatus.EXPIRED);
        if (adminId != null) {
            doc.setReviewedBy(adminId);
            doc.setReviewedAt(LocalDateTime.now());
            if (reason != null && !reason.isBlank()) {
                doc.setReviewNotes(reason.trim());
            }
        }

        Document saved = documentRepository.saveAndFlush(doc);

        recordDocumentAudit(adminId, AuditAction.DOCUMENT_EXPIRED, saved.getId().toString(),
                "Expired " + saved.getCategory() + " (" + saved.getTitle() + ")");

        eventPublisher.publishEvent(new DocumentExpiredEvent(
                saved.getId(),
                saved.getOwnerId(),
                saved.getOwnerType(),
                saved.getCategory(),
                saved.getUploadedBy()
        ));

        return new DocumentResponse(saved);
    }

    @Transactional(readOnly = true)
    public DocumentComplianceStatsDto getComplianceStats() {
        long pending = documentRepository.countByVerificationStatus("PENDING_REVIEW");
        long approved = documentRepository.countByVerificationStatus("APPROVED");
        long rejected = documentRepository.countByVerificationStatus("REJECTED");
        long expired = documentRepository.countByVerificationStatus("EXPIRED");
        long expiringSoon = documentRepository.countByVerificationStatusAndExpiryDateBetweenAndIsActiveTrue(
                "APPROVED", LocalDate.now(), LocalDate.now().plusDays(30));
        long total = documentRepository.count();

        return new DocumentComplianceStatsDto(pending, approved, rejected, expired, expiringSoon, total);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> searchDocuments(
            String status,
            DocumentCategory category,
            DocumentOwnerType ownerType,
            UUID ownerId,
            String search,
            Pageable pageable) {

        Specification<Document> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("verificationStatus"), status.toUpperCase()));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (ownerType != null) {
                predicates.add(cb.equal(root.get("ownerType"), ownerType));
            }

            if (ownerId != null) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                Predicate fileNameMatch = cb.like(cb.lower(root.get("originalFileName")), pattern);
                Predicate docNumMatch = cb.like(cb.lower(root.get("documentNumber")), pattern);
                predicates.add(cb.or(titleMatch, fileNameMatch, docNumMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return documentRepository.findAll(spec, pageable).map(DocumentResponse::new);
    }

    private void recordDocumentAudit(UUID actorId, AuditAction action, String targetId, String details) {
        if (actorId == null) {
            return;
        }
        try {
            User actor = userRepository.findById(actorId).orElse(null);
            if (actor != null) {
                auditService.recordUserAction(actor, action, AuditTargetType.DOCUMENT, targetId, details);
            }
        } catch (Exception e) {
            log.warn("Failed to record document audit log for actor {}: {}", actorId, e.getMessage());
        }
    }
}
