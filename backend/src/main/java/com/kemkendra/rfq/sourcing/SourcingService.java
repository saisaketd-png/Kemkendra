package com.kemkendra.rfq.sourcing;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationEntityType;
import com.kemkendra.notification.NotificationService;
import com.kemkendra.notification.NotificationType;
import com.kemkendra.notification.email.EmailNotificationService;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.rfq.sourcing.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class SourcingService {

    private static final Logger log = LoggerFactory.getLogger(SourcingService.class);

    private final SourcingRequestRepository sourcingRequestRepository;
    private final SourcingAssignmentRepository sourcingAssignmentRepository;
    private final SourcingSupplierRepository sourcingSupplierRepository;
    private final SourcingOutreachLogRepository sourcingOutreachLogRepository;
    private final SourcingQuotationRepository sourcingQuotationRepository;
    private final SourcingProposalRepository sourcingProposalRepository;
    private final SourcingProposalOptionRepository sourcingProposalOptionRepository;
    private final SourcingStatusHistoryRepository sourcingStatusHistoryRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;

    private NotificationService notificationService;
    private EmailNotificationService emailNotificationService;

    @Autowired
    public void setNotificationServices(
            @Autowired(required = false) NotificationService notificationService,
            @Autowired(required = false) EmailNotificationService emailNotificationService) {
        this.notificationService = notificationService;
        this.emailNotificationService = emailNotificationService;
    }

    private void notifyBuyer(UUID buyerId, NotificationType type, String title, String message, UUID requestId) {
        if (buyerId == null || notificationService == null) return;
        try {
            Notification n = notificationService.createNotification(
                    buyerId,
                    type,
                    title,
                    message,
                    NotificationEntityType.SOURCING_REQUEST,
                    requestId
            );
            if (n != null && emailNotificationService != null) {
                emailNotificationService.sendNotificationEmail(n);
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch sourcing notification {} for buyer {}: {}", type, buyerId, e.getMessage());
        }
    }

    public SourcingService(
            SourcingRequestRepository sourcingRequestRepository,
            SourcingAssignmentRepository sourcingAssignmentRepository,
            SourcingSupplierRepository sourcingSupplierRepository,
            SourcingOutreachLogRepository sourcingOutreachLogRepository,
            SourcingQuotationRepository sourcingQuotationRepository,
            SourcingProposalRepository sourcingProposalRepository,
            SourcingStatusHistoryRepository sourcingStatusHistoryRepository,
            UserRepository userRepository
    ) {
        this(
                sourcingRequestRepository,
                sourcingAssignmentRepository,
                sourcingSupplierRepository,
                sourcingOutreachLogRepository,
                sourcingQuotationRepository,
                sourcingProposalRepository,
                null,
                sourcingStatusHistoryRepository,
                userRepository,
                null
        );
    }

    public SourcingService(
            SourcingRequestRepository sourcingRequestRepository,
            SourcingAssignmentRepository sourcingAssignmentRepository,
            SourcingSupplierRepository sourcingSupplierRepository,
            SourcingOutreachLogRepository sourcingOutreachLogRepository,
            SourcingQuotationRepository sourcingQuotationRepository,
            SourcingProposalRepository sourcingProposalRepository,
            SourcingStatusHistoryRepository sourcingStatusHistoryRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository
    ) {
        this(
                sourcingRequestRepository,
                sourcingAssignmentRepository,
                sourcingSupplierRepository,
                sourcingOutreachLogRepository,
                sourcingQuotationRepository,
                sourcingProposalRepository,
                null,
                sourcingStatusHistoryRepository,
                userRepository,
                supplierRepository
        );
    }

    public SourcingService(
            SourcingRequestRepository sourcingRequestRepository,
            SourcingAssignmentRepository sourcingAssignmentRepository,
            SourcingSupplierRepository sourcingSupplierRepository,
            SourcingOutreachLogRepository sourcingOutreachLogRepository,
            SourcingQuotationRepository sourcingQuotationRepository,
            SourcingProposalRepository sourcingProposalRepository,
            SourcingProposalOptionRepository sourcingProposalOptionRepository,
            SourcingStatusHistoryRepository sourcingStatusHistoryRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository
    ) {
        this.sourcingRequestRepository = sourcingRequestRepository;
        this.sourcingAssignmentRepository = sourcingAssignmentRepository;
        this.sourcingSupplierRepository = sourcingSupplierRepository;
        this.sourcingOutreachLogRepository = sourcingOutreachLogRepository;
        this.sourcingQuotationRepository = sourcingQuotationRepository;
        this.sourcingProposalRepository = sourcingProposalRepository;
        this.sourcingProposalOptionRepository = sourcingProposalOptionRepository;
        this.sourcingStatusHistoryRepository = sourcingStatusHistoryRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
    }

    /**
     * Create a new sourcing request submitted by an authenticated buyer.
     */
    public SourcingRequestDetailDto createRequest(CreateSourcingRequestDto dto, Authentication authentication) {
        User buyer = getAuthenticatedUser(authentication);

        if (buyer.getStatus() != UserStatus.ACTIVE || buyer.getDeletedAt() != null) {
            throw new AccessDeniedException("Active buyer account required to submit sourcing requests");
        }

        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyer.getId());
        request.setProductName(dto.productName().trim());
        request.setCategory(dto.category().trim());
        request.setTargetQuantity(dto.quantity());
        request.setUnit(dto.unit().trim());
        request.setDeliveryLocation(dto.deliveryLocation().trim());

        if (dto.casNumber() != null && !dto.casNumber().isBlank()) {
            request.setCasNumber(dto.casNumber().trim());
        }
        if (dto.grade() != null && !dto.grade().isBlank()) {
            request.setGrade(dto.grade().trim());
        }
        if (dto.specifications() != null && !dto.specifications().isBlank()) {
            request.setSpecifications(dto.specifications().trim());
        }
        if (dto.pharmacopeialStandard() != null && !dto.pharmacopeialStandard().isBlank()) {
            request.setPharmacopeialStandard(dto.pharmacopeialStandard().trim());
        }
        if (dto.packaging() != null && !dto.packaging().isBlank()) {
            request.setPackaging(dto.packaging().trim());
        }
        if (dto.targetPrice() != null) {
            request.setTargetPrice(dto.targetPrice());
        }
        request.setCurrency(dto.currency() != null && !dto.currency().isBlank() ? dto.currency().trim().toUpperCase() : "INR");
        request.setExpectedDeliveryDate(dto.expectedDeliveryDate());

        if (dto.additionalRequirements() != null && !dto.additionalRequirements().isBlank()) {
            request.setAdditionalRequirements(dto.additionalRequirements().trim());
        }
        if (dto.attachmentReferences() != null && !dto.attachmentReferences().isBlank()) {
            request.setAttachmentReferences(dto.attachmentReferences().trim());
        }

        request.setStatus(SourcingRequestStatus.SUBMITTED);
        SourcingRequest saved = sourcingRequestRepository.save(request);

        // Record initial status history
        SourcingStatusHistory history = new SourcingStatusHistory();
        history.setSourcingRequestId(saved.getId());
        history.setPreviousStatus(null);
        history.setNewStatus(SourcingRequestStatus.SUBMITTED.name());
        history.setChangedByUserId(buyer.getId());
        history.setReasonOrNotes("Sourcing request submitted by buyer");
        sourcingStatusHistoryRepository.save(history);

        notifyBuyer(
                saved.getBuyerId(),
                NotificationType.SOURCING_REQUEST_SUBMITTED,
                "Sourcing Request Submitted: " + saved.getSourcingRequestReference(),
                "Your chemical sourcing request for " + saved.getProductName() + " (" + saved.getTargetQuantity() + " " + saved.getUnit() + ") has been received by KemKendra. Our specialists are reviewing specifications.",
                saved.getId()
        );

        return buildDetailDto(saved, buyer);
    }

    /**
     * Get sourcing requests owned by the authenticated buyer (List or Paged).
     */
    @Transactional(readOnly = true)
    public List<SourcingRequestSummaryDto> getMyRequests(Authentication authentication) {
        User buyer = getAuthenticatedUser(authentication);
        List<SourcingRequest> requests = sourcingRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId());
        return requests.stream()
                .map(r -> buildSummaryDto(r, buyer))
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<SourcingRequestSummaryDto> getMyRequests(Authentication authentication, Pageable pageable) {
        User buyer = getAuthenticatedUser(authentication);
        Page<SourcingRequest> page = sourcingRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyer.getId(), pageable);
        return page.map(r -> buildSummaryDto(r, buyer));
    }

    /**
     * Get sourcing request detail for buyer (or admin).
     * Enforces that buyers can only view their own requests.
     */
    @Transactional(readOnly = true)
    public SourcingRequestDetailDto getRequestDetail(UUID id, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isAdmin && !request.getBuyerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to access this sourcing request");
        }

        User buyer = isAdmin && !request.getBuyerId().equals(currentUser.getId())
                ? userRepository.findById(request.getBuyerId()).orElse(null)
                : currentUser;

        return buildDetailDto(request, buyer, !isAdmin);
    }

    /**
     * Administrative: List all sourcing requests with optional status and text search filtering.
     */
    @Transactional(readOnly = true)
    public Page<SourcingRequestSummaryDto> getAdminRequests(SourcingRequestStatus status, String query, Pageable pageable) {
        Page<SourcingRequest> page = sourcingRequestRepository.searchRequests(status, query, pageable);
        Map<UUID, User> userCache = new HashMap<>();

        return page.map(r -> {
            User buyer = userCache.computeIfAbsent(r.getBuyerId(),
                    bId -> userRepository.findById(bId).orElse(null));
            return buildSummaryDto(r, buyer);
        });
    }

    /**
     * Administrative: Get full detail with all sub-collections (assignments, suppliers, outreach, quotations, proposals).
     */
    @Transactional(readOnly = true)
    public SourcingRequestDetailDto getAdminRequestDetail(UUID id) {
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        User buyer = userRepository.findById(request.getBuyerId()).orElse(null);
        return buildDetailDto(request, buyer, false);
    }

    /**
     * Administrative: Update the lifecycle status of a sourcing request with audit trail.
     */
    public SourcingRequestDetailDto updateStatus(UUID id, UpdateSourcingStatusRequestDto dto, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        SourcingRequestStatus oldStatus = request.getStatus();
        SourcingRequestStatus newStatus = dto.status();

        request.setStatus(newStatus);
        SourcingRequest saved = sourcingRequestRepository.save(request);

        // Record status transition in history
        SourcingStatusHistory history = new SourcingStatusHistory();
        history.setSourcingRequestId(saved.getId());
        history.setPreviousStatus(oldStatus != null ? oldStatus.name() : null);
        history.setNewStatus(newStatus.name());
        history.setChangedByUserId(adminUser.getId());
        history.setReasonOrNotes(dto.reasonOrNotes());
        sourcingStatusHistoryRepository.save(history);

        // Buyer Notification Dispatch
        if (saved.getBuyerId() != null) {
            switch (newStatus) {
                case ACCEPTED -> notifyBuyer(
                        saved.getBuyerId(),
                        NotificationType.SOURCING_REQUEST_ACCEPTED,
                        "Sourcing Request Accepted: " + saved.getSourcingRequestReference(),
                        "Your requirement for " + saved.getProductName() + " has been accepted by our procurement desk. Supplier identification has commenced.",
                        saved.getId()
                );
                case MORE_INFORMATION_REQUIRED -> {
                    String note = (dto.reasonOrNotes() != null && !dto.reasonOrNotes().isBlank())
                            ? " Required Details: " + dto.reasonOrNotes().trim()
                            : "";
                    notifyBuyer(
                            saved.getBuyerId(),
                            NotificationType.SOURCING_MORE_INFORMATION_REQUIRED,
                            "Additional Information Required: " + saved.getSourcingRequestReference(),
                            "Our sourcing team requires additional details for " + saved.getProductName() + " to proceed with supplier outreach." + note,
                            saved.getId()
                    );
                }
                case SOURCING -> notifyBuyer(
                        saved.getBuyerId(),
                        NotificationType.SOURCING_STARTED,
                        "Sourcing Started: " + saved.getSourcingRequestReference(),
                        "We have initiated direct manufacturer outreach for " + saved.getProductName() + ".",
                        saved.getId()
                );
                case CLOSED -> notifyBuyer(
                        saved.getBuyerId(),
                        NotificationType.SOURCING_REQUEST_CLOSED,
                        "Sourcing Request Closed: " + saved.getSourcingRequestReference(),
                        "Your sourcing inquiry for " + saved.getProductName() + " has been closed.",
                        saved.getId()
                );
                case REJECTED -> notifyBuyer(
                        saved.getBuyerId(),
                        NotificationType.SOURCING_REQUEST_CLOSED,
                        "Sourcing Request Update: " + saved.getSourcingRequestReference(),
                        "Your sourcing inquiry for " + saved.getProductName() + " could not be fulfilled at this time.",
                        saved.getId()
                );
                default -> {}
            }
        }

        User buyer = userRepository.findById(saved.getBuyerId()).orElse(null);
        return buildDetailDto(saved, buyer);
    }

    /**
     * Buyer provides requested additional information to unblock the sourcing workflow.
     */
    public SourcingRequestDetailDto provideAdditionalInformation(UUID id, ProvideAdditionalInformationDto dto, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isAdmin && !request.getBuyerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to update this sourcing request");
        }

        SourcingRequestStatus oldStatus = request.getStatus();
        // If additional info was requested, transition status back to UNDER_REVIEW
        if (oldStatus == SourcingRequestStatus.MORE_INFORMATION_REQUIRED) {
            request.setStatus(SourcingRequestStatus.UNDER_REVIEW);
        }

        // Append to additional requirements if provided
        if (dto.additionalInfo() != null && !dto.additionalInfo().isBlank()) {
            String supplement = "\n\n[Buyer Additional Info]: " + dto.additionalInfo().trim();
            String currentReqs = request.getAdditionalRequirements() != null ? request.getAdditionalRequirements() : "";
            request.setAdditionalRequirements(currentReqs + supplement);
        }

        // Append attachment references if provided
        if (dto.attachmentReferences() != null && !dto.attachmentReferences().isBlank()) {
            String currentAtts = request.getAttachmentReferences() != null ? request.getAttachmentReferences() : "";
            if (!currentAtts.isBlank()) {
                request.setAttachmentReferences(currentAtts + "," + dto.attachmentReferences().trim());
            } else {
                request.setAttachmentReferences(dto.attachmentReferences().trim());
            }
        }

        SourcingRequest saved = sourcingRequestRepository.save(request);

        // Record audit history entry
        SourcingStatusHistory history = new SourcingStatusHistory();
        history.setSourcingRequestId(saved.getId());
        history.setPreviousStatus(oldStatus != null ? oldStatus.name() : null);
        history.setNewStatus(saved.getStatus().name());
        history.setChangedByUserId(currentUser.getId());
        history.setReasonOrNotes("Buyer provided additional information: " + dto.additionalInfo().trim());
        sourcingStatusHistoryRepository.save(history);

        User buyer = userRepository.findById(saved.getBuyerId()).orElse(null);
        return buildDetailDto(saved, buyer, !isAdmin);
    }

    /**
     * Administrative: Get real-time overview counts for Sourcing Management dashboard.
     */
    @Transactional(readOnly = true)
    public SourcingStatsDto getSourcingStats() {
        long total = sourcingRequestRepository.count();
        long newReqs = sourcingRequestRepository.countByStatus(SourcingRequestStatus.SUBMITTED);
        long inProgress = sourcingRequestRepository.countByStatusIn(List.of(
                SourcingRequestStatus.UNDER_REVIEW,
                SourcingRequestStatus.ACCEPTED,
                SourcingRequestStatus.SOURCING,
                SourcingRequestStatus.SUPPLIER_CONTACTED,
                SourcingRequestStatus.QUOTATIONS_RECEIVED,
                SourcingRequestStatus.PROPOSAL_READY,
                SourcingRequestStatus.OPEN,
                SourcingRequestStatus.PARTIALLY_QUOTED
        ));
        long proposalsSent = sourcingRequestRepository.countByStatusIn(List.of(
                SourcingRequestStatus.PROPOSAL_SENT,
                SourcingRequestStatus.NEGOTIATION
        ));
        long completed = sourcingRequestRepository.countByStatusIn(List.of(
                SourcingRequestStatus.FULFILLED,
                SourcingRequestStatus.CLOSED,
                SourcingRequestStatus.COMPLETED
        ));
        long moreInfo = sourcingRequestRepository.countByStatus(SourcingRequestStatus.MORE_INFORMATION_REQUIRED);
        long rejected = sourcingRequestRepository.countByStatusIn(List.of(
                SourcingRequestStatus.REJECTED,
                SourcingRequestStatus.CANCELLED
        ));

        return new SourcingStatsDto(total, newReqs, inProgress, proposalsSent, completed, moreInfo, rejected);
    }

    /**
     * Administrative: Assign or reassign a sourcing executive to a request.
     */
    public SourcingRequestDetailDto assignExecutive(UUID id, AssignExecutiveDto dto, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        User executive = userRepository.findById(dto.assignedToUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Executive user not found: " + dto.assignedToUserId()));

        // Deactivate previous active assignments
        List<SourcingAssignment> existingAssignments = sourcingAssignmentRepository.findBySourcingRequestIdOrderByCreatedAtDesc(id);
        for (SourcingAssignment a : existingAssignments) {
            if (a.isActive()) {
                a.setActive(false);
                sourcingAssignmentRepository.save(a);
            }
        }

        // Create new assignment
        SourcingAssignment assignment = new SourcingAssignment();
        assignment.setSourcingRequestId(id);
        assignment.setAssignedToUserId(executive.getId());
        assignment.setAssignedByUserId(adminUser.getId());
        assignment.setRole(dto.role() != null && !dto.role().isBlank() ? dto.role().trim() : "SOURCING_EXECUTIVE");
        assignment.setNotes(dto.notes());
        assignment.setActive(true);
        sourcingAssignmentRepository.save(assignment);

        request.setAssignedToUserId(executive.getId());

        // If request was SUBMITTED, transition to UNDER_REVIEW
        if (request.getStatus() == SourcingRequestStatus.SUBMITTED) {
            request.setStatus(SourcingRequestStatus.UNDER_REVIEW);

            SourcingStatusHistory history = new SourcingStatusHistory();
            history.setSourcingRequestId(id);
            history.setPreviousStatus(SourcingRequestStatus.SUBMITTED.name());
            history.setNewStatus(SourcingRequestStatus.UNDER_REVIEW.name());
            history.setChangedByUserId(adminUser.getId());
            history.setReasonOrNotes("Assigned to " + executive.getName() + "; review commenced.");
            sourcingStatusHistoryRepository.save(history);
        }

        SourcingRequest saved = sourcingRequestRepository.save(request);
        User buyer = userRepository.findById(saved.getBuyerId()).orElse(null);
        return buildDetailDto(saved, buyer);
    }

    /**
     * Administrative: Update private internal notes for a sourcing request.
     */
    public SourcingRequestDetailDto updateNotes(UUID id, UpdateSourcingNotesDto dto, Authentication authentication) {
        getAuthenticatedUser(authentication); // verify admin auth
        SourcingRequest request = sourcingRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + id));

        request.setNotes(dto.notes());
        SourcingRequest saved = sourcingRequestRepository.save(request);
        User buyer = userRepository.findById(saved.getBuyerId()).orElse(null);
        return buildDetailDto(saved, buyer);
    }

    // =========================================================================
    // SUPPLIER MANAGEMENT & OUTREACH FOR SOURCING
    // =========================================================================

    /**
     * Add a supplier to a sourcing request.
     * Reuses existing KemKendra supplier profiles to avoid duplicate records.
     */
    public SourcingSupplierDto addSupplier(UUID requestId, AddSourcingSupplierDto dto, Authentication auth) {
        getAuthenticatedUser(auth); // verify admin auth
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        String trimmedName = dto.supplierName().trim();

        // Prevent duplicate supplier by name in this request
        if (sourcingSupplierRepository.existsBySourcingRequestIdAndSupplierNameIgnoreCase(requestId, trimmedName)) {
            throw new IllegalArgumentException("Supplier with name '" + trimmedName + "' is already added to this sourcing request.");
        }

        Long resolvedSupplierId = dto.supplierId();
        String resolvedWebsite = dto.website() != null ? dto.website().trim() : null;
        String resolvedLocation = dto.location() != null ? dto.location().trim() : null;
        String resolvedContactPerson = dto.contactPerson() != null ? dto.contactPerson().trim() : null;
        String resolvedEmail = dto.contactEmail() != null ? dto.contactEmail().trim() : null;
        String resolvedPhone = dto.contactPhone() != null ? dto.contactPhone().trim() : null;
        String resolvedType = dto.supplierType() != null && !dto.supplierType().isBlank() ? dto.supplierType().trim() : "MANUFACTURER";
        String resolvedVerification = dto.verificationStatus() != null && !dto.verificationStatus().isBlank() ? dto.verificationStatus().trim() : "UNVERIFIED";

        // Reuse existing KemKendra supplier profile wherever possible:
        Supplier matchedExisting = null;
        final String lookupEmail = resolvedEmail;
        if (resolvedSupplierId != null) {
            if (sourcingSupplierRepository.existsBySourcingRequestIdAndSupplierId(requestId, resolvedSupplierId)) {
                throw new IllegalArgumentException("This registered supplier is already linked to this sourcing request.");
            }
            matchedExisting = supplierRepository.findById(resolvedSupplierId).orElse(null);
        } else {
            // Check if existing registered supplier matches by company name or business email
            matchedExisting = supplierRepository.findFirstByNameIgnoreCase(trimmedName)
                    .orElseGet(() -> lookupEmail != null && !lookupEmail.isBlank()
                            ? supplierRepository.findFirstByBusinessEmailIgnoreCase(lookupEmail).orElse(null)
                            : null);
        }

        if (matchedExisting != null) {
            resolvedSupplierId = matchedExisting.getId();
            if (resolvedWebsite == null || resolvedWebsite.isBlank()) {
                resolvedWebsite = matchedExisting.getWebsite();
            }
            if (resolvedLocation == null || resolvedLocation.isBlank()) {
                StringBuilder loc = new StringBuilder();
                if (matchedExisting.getCity() != null) loc.append(matchedExisting.getCity());
                if (matchedExisting.getStateProvince() != null) {
                    if (loc.length() > 0) loc.append(", ");
                    loc.append(matchedExisting.getStateProvince());
                }
                if (matchedExisting.getCountryName() != null) {
                    if (loc.length() > 0) loc.append(", ");
                    loc.append(matchedExisting.getCountryName());
                }
                if (loc.length() > 0) resolvedLocation = loc.toString();
            }
            if (resolvedContactPerson == null || resolvedContactPerson.isBlank()) {
                resolvedContactPerson = matchedExisting.getAuthorizedRepresentativeName();
            }
            if (resolvedEmail == null || resolvedEmail.isBlank()) {
                resolvedEmail = matchedExisting.getBusinessEmail();
            }
            if (resolvedPhone == null || resolvedPhone.isBlank()) {
                resolvedPhone = matchedExisting.getBusinessPhone();
            }
            if (dto.supplierType() == null || dto.supplierType().isBlank()) {
                resolvedType = matchedExisting.getBusinessType() != null ? matchedExisting.getBusinessType() : "MANUFACTURER";
            }
            if (dto.verificationStatus() == null || dto.verificationStatus().isBlank()) {
                resolvedVerification = matchedExisting.getVerificationStatus() != null
                        ? matchedExisting.getVerificationStatus().name()
                        : (Boolean.TRUE.equals(matchedExisting.getVerified()) ? "VERIFIED" : "UNVERIFIED");
            }
        }

        SourcingSupplier supplier = new SourcingSupplier();
        supplier.setSourcingRequestId(requestId);
        supplier.setSupplierId(resolvedSupplierId);
        supplier.setSupplierName(trimmedName);
        supplier.setContactPerson(resolvedContactPerson);
        supplier.setContactEmail(resolvedEmail);
        supplier.setContactPhone(resolvedPhone);
        supplier.setWebsite(resolvedWebsite);
        supplier.setLocation(resolvedLocation);
        supplier.setSupplierType(resolvedType);
        supplier.setProductsSupplied(dto.productsSupplied());
        supplier.setVerificationStatus(resolvedVerification);
        supplier.setStatus("IDENTIFIED");
        supplier.setNotes(dto.notes());

        SourcingSupplier saved = sourcingSupplierRepository.save(supplier);

        // Auto-advance request status to SOURCING if in initial acceptance
        if (request.getStatus() == SourcingRequestStatus.ACCEPTED) {
            request.setStatus(SourcingRequestStatus.SOURCING);
            sourcingRequestRepository.save(request);
        }

        return mapSupplierToDto(saved);
    }

    /**
     * Update an identified supplier's information.
     */
    public SourcingSupplierDto updateSupplier(UUID requestId, UUID supplierId, UpdateSourcingSupplierDto dto, Authentication auth) {
        getAuthenticatedUser(auth); // verify admin auth
        SourcingSupplier supplier = sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for sourcing request: " + supplierId));

        supplier.setSupplierName(dto.supplierName().trim());
        supplier.setContactPerson(dto.contactPerson());
        supplier.setContactEmail(dto.contactEmail());
        supplier.setContactPhone(dto.contactPhone());
        supplier.setWebsite(dto.website());
        supplier.setLocation(dto.location());
        if (dto.supplierType() != null && !dto.supplierType().isBlank()) {
            supplier.setSupplierType(dto.supplierType().trim());
        }
        supplier.setProductsSupplied(dto.productsSupplied());
        if (dto.verificationStatus() != null && !dto.verificationStatus().isBlank()) {
            supplier.setVerificationStatus(dto.verificationStatus().trim());
        }
        if (dto.status() != null && !dto.status().isBlank()) {
            supplier.setStatus(dto.status().trim());
        }
        supplier.setNotes(dto.notes());

        SourcingSupplier saved = sourcingSupplierRepository.save(supplier);
        return mapSupplierToDto(saved);
    }

    /**
     * Delete an identified supplier from a sourcing request.
     */
    public void deleteSupplier(UUID requestId, UUID supplierId, Authentication auth) {
        getAuthenticatedUser(auth);
        SourcingSupplier supplier = sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for sourcing request: " + supplierId));

        sourcingSupplierRepository.delete(supplier);
    }

    /**
     * List all suppliers associated with a sourcing request.
     */
    @Transactional(readOnly = true)
    public List<SourcingSupplierDto> getSuppliersForRequest(UUID requestId) {
        return sourcingSupplierRepository.findBySourcingRequestIdOrderByCreatedAtDesc(requestId)
                .stream().map(this::mapSupplierToDto).toList();
    }

    /**
     * Record a supplier outreach interaction, update supplier status, and optionally schedule next follow-up.
     */
    public SourcingOutreachLogDto logOutreach(UUID requestId, CreateOutreachLogDto dto, Authentication auth) {
        User adminUser = getAuthenticatedUser(auth);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        SourcingSupplier supplier = null;
        if (dto.sourcingSupplierId() != null) {
            supplier = sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, dto.sourcingSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for sourcing request: " + dto.sourcingSupplierId()));

            // Update supplier status based on outreach response
            if ("IDENTIFIED".equalsIgnoreCase(supplier.getStatus())) {
                supplier.setStatus("CONTACTED");
            }
            if ("QUOTE_PROVIDED".equalsIgnoreCase(dto.responseStatus())) {
                supplier.setStatus("QUOTED");
            } else if ("INTERESTED".equalsIgnoreCase(dto.responseStatus())) {
                supplier.setStatus("RESPONDED");
            } else if ("NOT_INTERESTED".equalsIgnoreCase(dto.responseStatus())) {
                supplier.setStatus("DECLINED");
            }
            sourcingSupplierRepository.save(supplier);
        }

        SourcingOutreachLog log = new SourcingOutreachLog();
        log.setSourcingRequestId(requestId);
        log.setSourcingSupplierId(dto.sourcingSupplierId());
        log.setOutreachChannel(dto.outreachChannel().trim().toUpperCase());
        log.setContactDate(dto.contactDate() != null ? dto.contactDate() : LocalDateTime.now());
        log.setContactPerson(dto.contactPerson());
        log.setPerformedByUserId(adminUser.getId());
        log.setResponseStatus(dto.responseStatus() != null ? dto.responseStatus().trim().toUpperCase() : "PENDING");
        log.setSubject(dto.subject());
        log.setDetails(dto.details().trim());
        log.setOutcome(dto.outcome() != null ? dto.outcome().trim() : dto.responseStatus());
        log.setNextFollowUpDate(dto.nextFollowUpDate());
        log.setNotes(dto.notes());
        log.setLoggedAt(LocalDateTime.now());

        SourcingOutreachLog saved = sourcingOutreachLogRepository.save(log);

        // Advance request status if currently in SOURCING
        if (request.getStatus() == SourcingRequestStatus.SOURCING) {
            request.setStatus(SourcingRequestStatus.SUPPLIER_CONTACTED);
            sourcingRequestRepository.save(request);

            SourcingStatusHistory history = new SourcingStatusHistory();
            history.setSourcingRequestId(requestId);
            history.setPreviousStatus(SourcingRequestStatus.SOURCING.name());
            history.setNewStatus(SourcingRequestStatus.SUPPLIER_CONTACTED.name());
            history.setChangedByUserId(adminUser.getId());
            history.setReasonOrNotes("Supplier outreach logged: " + (supplier != null ? supplier.getSupplierName() : "External supplier"));
            sourcingStatusHistoryRepository.save(history);
        }

        String supplierName = supplier != null ? supplier.getSupplierName() : null;
        return new SourcingOutreachLogDto(
                saved.getId(),
                saved.getSourcingRequestId(),
                saved.getSourcingSupplierId(),
                supplierName,
                saved.getOutreachChannel(),
                saved.getContactDate(),
                saved.getContactPerson(),
                saved.getPerformedByUserId(),
                adminUser.getName(),
                saved.getResponseStatus(),
                saved.getSubject(),
                saved.getDetails(),
                saved.getOutcome(),
                saved.getNextFollowUpDate(),
                saved.getNotes(),
                saved.getLoggedAt()
        );
    }

    /**
     * Retrieve outreach contact history for a specific supplier on a request.
     */
    @Transactional(readOnly = true)
    public List<SourcingOutreachLogDto> getSupplierOutreachHistory(UUID requestId, UUID supplierId) {
        SourcingSupplier supplier = sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + supplierId));

        List<SourcingOutreachLog> logs = sourcingOutreachLogRepository
                .findBySourcingRequestIdAndSourcingSupplierIdOrderByLoggedAtDesc(requestId, supplierId);

        return logs.stream().map(l -> {
            String userName = userRepository.findById(l.getPerformedByUserId()).map(User::getName).orElse(null);
            return new SourcingOutreachLogDto(
                    l.getId(),
                    l.getSourcingRequestId(),
                    l.getSourcingSupplierId(),
                    supplier.getSupplierName(),
                    l.getOutreachChannel(),
                    l.getContactDate(),
                    l.getContactPerson(),
                    l.getPerformedByUserId(),
                    userName,
                    l.getResponseStatus(),
                    l.getSubject(),
                    l.getDetails(),
                    l.getOutcome(),
                    l.getNextFollowUpDate(),
                    l.getNotes(),
                    l.getLoggedAt()
            );
        }).toList();
    }

    /**
     * Search existing registered KemKendra suppliers by company name or legal name to reuse profile and avoid duplicate records.
     */
    @Transactional(readOnly = true)
    public List<RegisteredSupplierLookupDto> searchDirectorySuppliers(String query) {
        String cleanQuery = (query != null) ? query.trim() : "";
        if (cleanQuery.isBlank()) {
            return Collections.emptyList();
        }
        List<Supplier> results = supplierRepository.searchSuppliersForSourcing(cleanQuery, PageRequest.of(0, 15));
        return results.stream().map(s -> {
            StringBuilder loc = new StringBuilder();
            if (s.getCity() != null) loc.append(s.getCity());
            if (s.getStateProvince() != null) {
                if (loc.length() > 0) loc.append(", ");
                loc.append(s.getStateProvince());
            }
            if (s.getCountryName() != null) {
                if (loc.length() > 0) loc.append(", ");
                loc.append(s.getCountryName());
            }
            String locationStr = loc.length() > 0 ? loc.toString() : null;

            String verif = s.getVerificationStatus() != null
                    ? s.getVerificationStatus().name()
                    : (Boolean.TRUE.equals(s.getVerified()) ? "VERIFIED" : "UNVERIFIED");

            return new RegisteredSupplierLookupDto(
                    s.getId(),
                    s.getName(),
                    s.getLegalName(),
                    s.getBusinessType(),
                    s.getBusinessEmail(),
                    s.getBusinessPhone(),
                    s.getAuthorizedRepresentativeName(),
                    s.getWebsite(),
                    locationStr,
                    s.getVerified(),
                    verif,
                    s.getPrimaryCategories()
            );
        }).toList();
    }

    // =========================================================================
    // SUPPLIER QUOTATION MANAGEMENT (ADMIN)
    // =========================================================================

    /**
     * Add a supplier quotation for a sourcing request.
     */
    public SourcingQuotationDto addQuotation(UUID requestId, AddSourcingQuotationDto dto, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        SourcingSupplier supplier = null;
        if (dto.sourcingSupplierId() != null) {
            supplier = sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, dto.sourcingSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for request: " + dto.sourcingSupplierId()));
        }

        SourcingQuotation quotation = new SourcingQuotation();
        quotation.setSourcingRequestId(requestId);
        quotation.setSourcingSupplierId(dto.sourcingSupplierId());
        quotation.setQuotationReference("QT-" + System.currentTimeMillis() % 1000000 + "-" + String.format("%02d", new Random().nextInt(100)));
        quotation.setProductName(dto.productName().trim());
        quotation.setUnitPrice(dto.unitPrice());
        quotation.setCurrency(dto.currency() != null && !dto.currency().isBlank() ? dto.currency().trim().toUpperCase() : "INR");
        quotation.setUnit(dto.unit() != null && !dto.unit().isBlank() ? dto.unit().trim() : request.getUnit());
        quotation.setMinimumOrderQuantity(dto.minimumOrderQuantity());
        quotation.setAvailableQuantity(dto.availableQuantity());
        quotation.setProductGrade(dto.productGrade());
        quotation.setPuritySpecifications(dto.puritySpecifications());
        quotation.setPackaging(dto.packaging());
        quotation.setLeadTimeDays(dto.leadTimeDays());
        quotation.setDeliveryCharges(dto.deliveryCharges() != null ? dto.deliveryCharges() : BigDecimal.ZERO);
        quotation.setPaymentTerms(dto.paymentTerms());
        quotation.setIncoterms(dto.incoterms());
        quotation.setValidUntil(dto.validUntil());
        quotation.setNotes(dto.notes());
        quotation.setAttachmentUrl(dto.attachmentUrl());
        quotation.setSupportingDocuments(dto.supportingDocuments());
        quotation.setStatus("RECEIVED");
        quotation.setShareWithBuyer(Boolean.TRUE.equals(dto.shareWithBuyer()));

        SourcingQuotation saved = sourcingQuotationRepository.save(quotation);

        // Advance request status to QUOTATIONS_RECEIVED if in SOURCING or SUPPLIER_CONTACTED
        if (request.getStatus() == SourcingRequestStatus.SOURCING || request.getStatus() == SourcingRequestStatus.SUPPLIER_CONTACTED) {
            SourcingRequestStatus oldStatus = request.getStatus();
            request.setStatus(SourcingRequestStatus.QUOTATIONS_RECEIVED);
            sourcingRequestRepository.save(request);

            SourcingStatusHistory history = new SourcingStatusHistory();
            history.setSourcingRequestId(requestId);
            history.setPreviousStatus(oldStatus.name());
            history.setNewStatus(SourcingRequestStatus.QUOTATIONS_RECEIVED.name());
            history.setChangedByUserId(adminUser.getId());
            history.setReasonOrNotes("Supplier quotation added: " + saved.getQuotationReference() + " from " + (supplier != null ? supplier.getSupplierName() : "External Supplier"));
            sourcingStatusHistoryRepository.save(history);
        }

        return mapQuotationToDto(saved, supplier != null ? supplier.getSupplierName() : null, request.getTargetQuantity(), false);
    }

    /**
     * Update an existing supplier quotation.
     */
    public SourcingQuotationDto updateQuotation(UUID requestId, UUID quotationId, UpdateSourcingQuotationDto dto, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));
        SourcingQuotation quotation = sourcingQuotationRepository.findBySourcingRequestIdAndId(requestId, quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found: " + quotationId));

        if (dto.sourcingSupplierId() != null) {
            sourcingSupplierRepository.findBySourcingRequestIdAndId(requestId, dto.sourcingSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found for request: " + dto.sourcingSupplierId()));
            quotation.setSourcingSupplierId(dto.sourcingSupplierId());
        }

        quotation.setProductName(dto.productName().trim());
        quotation.setUnitPrice(dto.unitPrice());
        if (dto.currency() != null && !dto.currency().isBlank()) {
            quotation.setCurrency(dto.currency().trim().toUpperCase());
        }
        if (dto.unit() != null && !dto.unit().isBlank()) {
            quotation.setUnit(dto.unit().trim());
        }
        quotation.setMinimumOrderQuantity(dto.minimumOrderQuantity());
        quotation.setAvailableQuantity(dto.availableQuantity());
        quotation.setProductGrade(dto.productGrade());
        quotation.setPuritySpecifications(dto.puritySpecifications());
        quotation.setPackaging(dto.packaging());
        quotation.setLeadTimeDays(dto.leadTimeDays());
        quotation.setDeliveryCharges(dto.deliveryCharges() != null ? dto.deliveryCharges() : BigDecimal.ZERO);
        quotation.setPaymentTerms(dto.paymentTerms());
        quotation.setIncoterms(dto.incoterms());
        quotation.setValidUntil(dto.validUntil());
        quotation.setNotes(dto.notes());
        quotation.setAttachmentUrl(dto.attachmentUrl());
        quotation.setSupportingDocuments(dto.supportingDocuments());
        if (dto.status() != null && !dto.status().isBlank()) {
            quotation.setStatus(dto.status().trim().toUpperCase());
        }
        if (dto.shareWithBuyer() != null) {
            quotation.setShareWithBuyer(dto.shareWithBuyer());
        }

        SourcingQuotation saved = sourcingQuotationRepository.save(quotation);
        String supplierName = null;
        if (saved.getSourcingSupplierId() != null) {
            supplierName = sourcingSupplierRepository.findById(saved.getSourcingSupplierId()).map(SourcingSupplier::getSupplierName).orElse(null);
        }

        return mapQuotationToDto(saved, supplierName, request.getTargetQuantity(), false);
    }

    /**
     * Delete a supplier quotation.
     */
    public void deleteQuotation(UUID requestId, UUID quotationId, Authentication authentication) {
        getAuthenticatedUser(authentication);
        SourcingQuotation quotation = sourcingQuotationRepository.findBySourcingRequestIdAndId(requestId, quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found: " + quotationId));
        sourcingQuotationRepository.delete(quotation);
    }

    /**
     * Retrieve all quotations for a sourcing request with landed cost comparison metrics.
     */
    @Transactional(readOnly = true)
    public List<SourcingQuotationDto> getQuotationsForRequest(UUID requestId) {
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));
        List<SourcingQuotation> quotations = sourcingQuotationRepository.findBySourcingRequestIdOrderByCreatedAtDesc(requestId);
        Map<UUID, String> supplierMap = sourcingSupplierRepository.findBySourcingRequestIdOrderByCreatedAtDesc(requestId)
                .stream().collect(Collectors.toMap(SourcingSupplier::getId, SourcingSupplier::getSupplierName, (a, b) -> a));

        return quotations.stream()
                .map(q -> mapQuotationToDto(q, q.getSourcingSupplierId() != null ? supplierMap.get(q.getSourcingSupplierId()) : null, request.getTargetQuantity(), false))
                .toList();
    }

    // =========================================================================
    // SOURCING PROPOSAL MANAGEMENT (ADMIN & BUYER)
    // =========================================================================

    /**
     * Create a buyer-facing sourcing proposal with curated options from quotations.
     */
    public SourcingProposalDto createProposal(UUID requestId, CreateSourcingProposalDto dto, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        if (dto.options() == null || dto.options().isEmpty()) {
            throw new IllegalArgumentException("At least one proposal option is required");
        }

        CreateProposalOptionDto primaryOption = dto.options().get(0);
        String proposalRef = "PROP-" + System.currentTimeMillis() % 1000000 + "-" + String.format("%02d", new Random().nextInt(100));

        SourcingProposal proposal = new SourcingProposal();
        proposal.setSourcingRequestId(requestId);
        proposal.setProposalReference(proposalRef);
        proposal.setTitle(dto.title().trim());
        proposal.setOfferedPricePerUnit(primaryOption.offeredPricePerUnit());
        proposal.setCurrency(primaryOption.currency() != null && !primaryOption.currency().isBlank() ? primaryOption.currency().trim().toUpperCase() : "INR");
        proposal.setQuantity(primaryOption.quantity() != null ? primaryOption.quantity() : request.getTargetQuantity());
        proposal.setUnit(primaryOption.unit() != null && !primaryOption.unit().isBlank() ? primaryOption.unit().trim() : request.getUnit());
        proposal.setEstimatedDeliveryDays(primaryOption.leadTimeDays());
        proposal.setTermsAndConditions(dto.termsAndConditions());
        proposal.setSummaryNotes(dto.summaryNotes());
        proposal.setRecommendationNotes(dto.recommendationNotes());
        proposal.setProposalDocumentUrl(dto.proposalDocumentUrl());

        if (dto.publishImmediately()) {
            proposal.setStatus("PUBLISHED");
            proposal.setSentToBuyerAt(LocalDateTime.now());
        } else {
            proposal.setStatus("DRAFT");
        }

        SourcingProposal saved = sourcingProposalRepository.save(proposal);

        List<SourcingProposalOption> savedOptions = new ArrayList<>();
        if (sourcingProposalOptionRepository != null) {
            for (CreateProposalOptionDto optDto : dto.options()) {
                SourcingProposalOption option = new SourcingProposalOption();
                option.setSourcingProposalId(saved.getId());
                option.setSourcingQuotationId(optDto.sourcingQuotationId());
                option.setOptionLabel(optDto.optionLabel().trim());
                option.setSupplierDisplayName(optDto.supplierDisplayName().trim());
                option.setProductName(optDto.productName().trim());
                option.setGrade(optDto.grade());
                option.setPuritySpecifications(optDto.puritySpecifications());
                option.setOfferedPricePerUnit(optDto.offeredPricePerUnit());
                option.setCurrency(optDto.currency() != null && !optDto.currency().isBlank() ? optDto.currency().trim().toUpperCase() : "INR");
                option.setQuantity(optDto.quantity() != null ? optDto.quantity() : request.getTargetQuantity());
                option.setUnit(optDto.unit() != null && !optDto.unit().isBlank() ? optDto.unit().trim() : request.getUnit());
                option.setMoq(optDto.moq());
                option.setLeadTimeDays(optDto.leadTimeDays());
                option.setPackaging(optDto.packaging());
                option.setDeliveryTerms(optDto.deliveryTerms());
                option.setPaymentTerms(optDto.paymentTerms());
                option.setValidUntil(optDto.validUntil());
                option.setDocumentUrl(optDto.documentUrl());
                option.setRecommendationNotes(optDto.recommendationNotes());
                option.setStatus("OFFERED");
                savedOptions.add(sourcingProposalOptionRepository.save(option));
            }
        }

        // If published immediately, advance request status to PROPOSAL_SENT
        if (dto.publishImmediately()) {
            SourcingRequestStatus oldStatus = request.getStatus();
            request.setStatus(SourcingRequestStatus.PROPOSAL_SENT);
            sourcingRequestRepository.save(request);

            SourcingStatusHistory history = new SourcingStatusHistory();
            history.setSourcingRequestId(requestId);
            history.setPreviousStatus(oldStatus.name());
            history.setNewStatus(SourcingRequestStatus.PROPOSAL_SENT.name());
            history.setChangedByUserId(adminUser.getId());
            history.setReasonOrNotes("Proposal published to buyer: " + saved.getProposalReference() + " (" + saved.getTitle() + ")");
            sourcingStatusHistoryRepository.save(history);

            notifyBuyer(
                    request.getBuyerId(),
                    NotificationType.SOURCING_PROPOSAL_PUBLISHED,
                    "Sourcing Proposal Ready: " + request.getProductName(),
                    "A tailored commercial sourcing proposal (" + saved.getProposalReference() + ") with curated supplier options is ready for your review.",
                    request.getId()
            );
        }

        return mapProposalToDto(saved, savedOptions, false);
    }

    /**
     * Publish a draft proposal to make it accessible to the buyer.
     */
    public SourcingProposalDto publishProposal(UUID requestId, UUID proposalId, Authentication authentication) {
        User adminUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));
        SourcingProposal proposal = sourcingProposalRepository.findBySourcingRequestIdAndId(requestId, proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));

        proposal.setStatus("PUBLISHED");
        proposal.setSentToBuyerAt(LocalDateTime.now());
        SourcingProposal saved = sourcingProposalRepository.save(proposal);

        SourcingRequestStatus oldStatus = request.getStatus();
        request.setStatus(SourcingRequestStatus.PROPOSAL_SENT);
        sourcingRequestRepository.save(request);

        SourcingStatusHistory history = new SourcingStatusHistory();
        history.setSourcingRequestId(requestId);
        history.setPreviousStatus(oldStatus.name());
        history.setNewStatus(SourcingRequestStatus.PROPOSAL_SENT.name());
        history.setChangedByUserId(adminUser.getId());
        history.setReasonOrNotes("Proposal published to buyer: " + saved.getProposalReference());
        sourcingStatusHistoryRepository.save(history);

        notifyBuyer(
                request.getBuyerId(),
                NotificationType.SOURCING_PROPOSAL_PUBLISHED,
                "Sourcing Proposal Ready: " + request.getProductName(),
                "A tailored commercial sourcing proposal (" + saved.getProposalReference() + ") with curated supplier options is ready for your review.",
                request.getId()
        );

        List<SourcingProposalOption> options = sourcingProposalOptionRepository != null
                ? sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(proposalId)
                : Collections.emptyList();

        return mapProposalToDto(saved, options, false);
    }

    /**
     * Delete a proposal and its associated options.
     */
    public void deleteProposal(UUID requestId, UUID proposalId, Authentication authentication) {
        getAuthenticatedUser(authentication);
        SourcingProposal proposal = sourcingProposalRepository.findBySourcingRequestIdAndId(requestId, proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));

        if (sourcingProposalOptionRepository != null) {
            List<SourcingProposalOption> options = sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(proposalId);
            sourcingProposalOptionRepository.deleteAll(options);
        }
        sourcingProposalRepository.delete(proposal);
    }

    /**
     * Get published proposals for a buyer (strictly validates request ownership).
     */
    @Transactional(readOnly = true)
    public List<SourcingProposalDto> getBuyerPublishedProposals(UUID requestId, Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;
        if (!isAdmin && !request.getBuyerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Access denied to proposals for this sourcing request");
        }

        List<SourcingProposal> proposals = sourcingProposalRepository
                .findBySourcingRequestIdAndStatusInOrderByCreatedAtDesc(requestId, List.of("PUBLISHED", "ACCEPTED", "COMPLETED", "REJECTED"));

        return proposals.stream().map(p -> {
            List<SourcingProposalOption> options = sourcingProposalOptionRepository != null
                    ? sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(p.getId())
                    : Collections.emptyList();
            return mapProposalToDto(p, options, true);
        }).toList();
    }

    /**
     * Buyer expresses interest or accepts a curated supplier option in a proposal.
     */
    public SourcingProposalDto expressBuyerInterestInOption(UUID requestId, UUID proposalId, UUID optionId, BuyerOptionDecisionDto dto, Authentication authentication) {
        User buyer = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        boolean isAdmin = buyer.getRole() == UserRole.ADMIN;
        if (!isAdmin && !request.getBuyerId().equals(buyer.getId())) {
            throw new AccessDeniedException("Access denied to respond to this sourcing proposal");
        }

        SourcingProposal proposal = sourcingProposalRepository.findBySourcingRequestIdAndId(requestId, proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));

        if (!"PUBLISHED".equalsIgnoreCase(proposal.getStatus()) && !"ACCEPTED".equalsIgnoreCase(proposal.getStatus())) {
            throw new IllegalStateException("Proposal is not currently open for decisions: " + proposal.getStatus());
        }

        if (sourcingProposalOptionRepository == null) {
            throw new IllegalStateException("Proposal options repository not available");
        }

        SourcingProposalOption option = sourcingProposalOptionRepository.findBySourcingProposalIdAndId(proposalId, optionId)
                .orElseThrow(() -> new ResourceNotFoundException("Option not found: " + optionId));

        String decisionUpper = dto.decision() != null ? dto.decision().trim().toUpperCase() : "ACCEPTED";
        if ("ACCEPTED".equals(decisionUpper) || "INTERESTED".equals(decisionUpper)) {
            option.setStatus("ACCEPTED");
            proposal.setSelectedOptionId(option.getId());
            proposal.setStatus("ACCEPTED");
            proposal.setBuyerDecisionAt(LocalDateTime.now());
            if (dto.remarks() != null && !dto.remarks().isBlank()) {
                String existing = proposal.getBuyerFeedback() != null ? proposal.getBuyerFeedback() + "\n" : "";
                proposal.setBuyerFeedback(existing + "[" + LocalDateTime.now() + "] Selected " + option.getOptionLabel() + ": " + dto.remarks().trim());
            }

            // Update request status to NEGOTIATION
            SourcingRequestStatus oldStatus = request.getStatus();
            request.setStatus(SourcingRequestStatus.NEGOTIATION);
            sourcingRequestRepository.save(request);

            SourcingStatusHistory history = new SourcingStatusHistory();
            history.setSourcingRequestId(requestId);
            history.setPreviousStatus(oldStatus.name());
            history.setNewStatus(SourcingRequestStatus.NEGOTIATION.name());
            history.setChangedByUserId(buyer.getId());
            history.setReasonOrNotes("Buyer selected option: " + option.getOptionLabel() + " (" + option.getSupplierDisplayName() + "). Remarks: " + (dto.remarks() != null ? dto.remarks() : "None"));
            sourcingStatusHistoryRepository.save(history);
        } else {
            option.setStatus("DECLINED");
            if (dto.remarks() != null && !dto.remarks().isBlank()) {
                String existing = proposal.getBuyerFeedback() != null ? proposal.getBuyerFeedback() + "\n" : "";
                proposal.setBuyerFeedback(existing + "[" + LocalDateTime.now() + "] Declined " + option.getOptionLabel() + ": " + dto.remarks().trim());
            }
        }

        sourcingProposalOptionRepository.save(option);
        SourcingProposal saved = sourcingProposalRepository.save(proposal);
        List<SourcingProposalOption> allOptions = sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(proposalId);

        return mapProposalToDto(saved, allOptions, !isAdmin);
    }

    /**
     * Buyer submits clarification question or feedback on a proposal.
     */
    public SourcingProposalDto submitBuyerClarification(UUID requestId, UUID proposalId, BuyerClarificationRequestDto dto, Authentication authentication) {
        User buyer = getAuthenticatedUser(authentication);
        SourcingRequest request = sourcingRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Sourcing request not found: " + requestId));

        boolean isAdmin = buyer.getRole() == UserRole.ADMIN;
        if (!isAdmin && !request.getBuyerId().equals(buyer.getId())) {
            throw new AccessDeniedException("Access denied to submit clarification for this request");
        }

        SourcingProposal proposal = sourcingProposalRepository.findBySourcingRequestIdAndId(requestId, proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Proposal not found: " + proposalId));

        String entry = "[" + LocalDateTime.now() + " - Buyer Clarification]: "
                + (dto.subject() != null && !dto.subject().isBlank() ? dto.subject().trim() + ": " : "")
                + dto.question().trim();
        proposal.setBuyerFeedback(proposal.getBuyerFeedback() != null ? proposal.getBuyerFeedback() + "\n\n" + entry : entry);
        SourcingProposal saved = sourcingProposalRepository.save(proposal);

        // Record history log for team visibility
        SourcingStatusHistory history = new SourcingStatusHistory();
        history.setSourcingRequestId(requestId);
        history.setPreviousStatus(request.getStatus().name());
        history.setNewStatus(request.getStatus().name());
        history.setChangedByUserId(buyer.getId());
        history.setReasonOrNotes("Buyer clarification requested on " + saved.getProposalReference() + ": " + dto.question().trim());
        sourcingStatusHistoryRepository.save(history);

        List<SourcingProposalOption> options = sourcingProposalOptionRepository != null
                ? sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(proposalId)
                : Collections.emptyList();

        return mapProposalToDto(saved, options, !isAdmin);
    }

    private SourcingQuotationDto mapQuotationToDto(SourcingQuotation q, String supplierName, BigDecimal targetQuantity, boolean isBuyerView) {
        BigDecimal targetQty = (targetQuantity != null && targetQuantity.compareTo(BigDecimal.ZERO) > 0) ? targetQuantity : BigDecimal.ONE;
        BigDecimal unitPrice = q.getUnitPrice() != null ? q.getUnitPrice() : BigDecimal.ZERO;
        BigDecimal deliveryCharges = q.getDeliveryCharges() != null ? q.getDeliveryCharges() : BigDecimal.ZERO;
        BigDecimal landedCostPerUnit = unitPrice.add(deliveryCharges.divide(targetQty, 2, java.math.RoundingMode.HALF_UP));
        BigDecimal totalCost = unitPrice.multiply(targetQty).add(deliveryCharges);

        return new SourcingQuotationDto(
                q.getId(),
                q.getSourcingRequestId(),
                isBuyerView ? null : q.getSourcingSupplierId(),
                isBuyerView ? "Verified Supplier" : supplierName,
                q.getQuotationReference(),
                q.getProductName(),
                q.getUnitPrice(),
                q.getCurrency(),
                q.getUnit(),
                q.getMinimumOrderQuantity(),
                q.getAvailableQuantity(),
                q.getProductGrade(),
                q.getPuritySpecifications(),
                q.getPackaging(),
                q.getLeadTimeDays(),
                deliveryCharges,
                q.getPaymentTerms(),
                q.getIncoterms(),
                q.getValidUntil(),
                isBuyerView ? null : q.getNotes(),
                q.getAttachmentUrl(),
                q.getSupportingDocuments(),
                q.getStatus(),
                q.getShareWithBuyer(),
                landedCostPerUnit,
                totalCost,
                q.getCreatedAt(),
                q.getUpdatedAt()
        );
    }

    private SourcingProposalDto mapProposalToDto(SourcingProposal p, List<SourcingProposalOption> options, boolean isBuyerView) {
        List<SourcingProposalOptionDto> optDtos = options.stream().map(opt -> new SourcingProposalOptionDto(
                opt.getId(),
                opt.getSourcingProposalId(),
                isBuyerView ? null : opt.getSourcingQuotationId(),
                opt.getOptionLabel(),
                opt.getSupplierDisplayName(),
                opt.getProductName(),
                opt.getGrade(),
                opt.getPuritySpecifications(),
                opt.getOfferedPricePerUnit(),
                opt.getCurrency(),
                opt.getQuantity(),
                opt.getUnit(),
                opt.getMoq(),
                opt.getLeadTimeDays(),
                opt.getPackaging(),
                opt.getDeliveryTerms(),
                opt.getPaymentTerms(),
                opt.getValidUntil(),
                opt.getDocumentUrl(),
                opt.getRecommendationNotes(),
                opt.getStatus(),
                opt.getCreatedAt(),
                opt.getUpdatedAt()
        )).toList();

        return new SourcingProposalDto(
                p.getId(),
                p.getSourcingRequestId(),
                p.getProposalReference(),
                p.getTitle(),
                p.getOfferedPricePerUnit(),
                p.getCurrency(),
                p.getQuantity(),
                p.getUnit(),
                p.getEstimatedDeliveryDays(),
                p.getTermsAndConditions(),
                p.getSummaryNotes(),
                p.getRecommendationNotes(),
                p.getProposalDocumentUrl(),
                p.getStatus(),
                p.getSelectedOptionId(),
                p.getBuyerFeedback(),
                p.getSentToBuyerAt(),
                p.getBuyerDecisionAt(),
                optDtos,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private SourcingSupplierDto mapSupplierToDto(SourcingSupplier s) {
        return new SourcingSupplierDto(
                s.getId(),
                s.getSourcingRequestId(),
                s.getSupplierId(),
                s.getSupplierName(),
                s.getContactPerson(),
                s.getContactEmail(),
                s.getContactPhone(),
                s.getWebsite(),
                s.getLocation(),
                s.getSupplierType(),
                s.getProductsSupplied(),
                s.getVerificationStatus(),
                s.getStatus(),
                s.getNotes(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }

    private SourcingOutreachLogDto mapOutreachLogToDto(SourcingOutreachLog o, Map<UUID, String> supplierNameMap) {
        String perfName = userRepository.findById(o.getPerformedByUserId()).map(User::getName).orElse(null);
        String suppName = o.getSourcingSupplierId() != null ? supplierNameMap.get(o.getSourcingSupplierId()) : null;
        return new SourcingOutreachLogDto(
                o.getId(),
                o.getSourcingRequestId(),
                o.getSourcingSupplierId(),
                suppName,
                o.getOutreachChannel(),
                o.getContactDate(),
                o.getContactPerson(),
                o.getPerformedByUserId(),
                perfName,
                o.getResponseStatus(),
                o.getSubject(),
                o.getDetails(),
                o.getOutcome(),
                o.getNextFollowUpDate(),
                o.getNotes(),
                o.getLoggedAt()
        );
    }

    // =========================================================================
    // HELPER BUILDERS
    // =========================================================================

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authentication.getName()));
    }

    private SourcingRequestSummaryDto buildSummaryDto(SourcingRequest r, User buyer) {
        String buyerName = buyer != null ? buyer.getName() : "Unknown Buyer";
        String buyerEmail = buyer != null ? buyer.getEmail() : null;
        String buyerPhone = buyer != null ? buyer.getPhone() : null;
        String buyerCompany = null; // Stored at user or profile level if applicable

        String executiveName = null;
        if (r.getAssignedToUserId() != null) {
            executiveName = userRepository.findById(r.getAssignedToUserId())
                    .map(User::getName)
                    .orElse(null);
        }

        return new SourcingRequestSummaryDto(
                r.getId(),
                r.getSourcingRequestReference(),
                r.getBuyerId(),
                buyerName,
                buyerEmail,
                buyerPhone,
                buyerCompany,
                r.getProductName(),
                r.getCasNumber(),
                r.getCategory(),
                r.getGrade(),
                r.getTargetQuantity(),
                r.getUnit(),
                r.getDeliveryLocation(),
                r.getTargetPrice(),
                r.getCurrency(),
                r.getExpectedDeliveryDate(),
                r.getStatus(),
                r.getAssignedToUserId(),
                executiveName,
                r.getCreatedAt(),
                r.getUpdatedAt()
        );
    }

    private SourcingRequestDetailDto buildDetailDto(SourcingRequest r, User buyer) {
        return buildDetailDto(r, buyer, false);
    }

    private SourcingRequestDetailDto buildDetailDto(SourcingRequest r, User buyer, boolean isBuyerView) {
        String buyerName = buyer != null ? buyer.getName() : "Unknown Buyer";
        String buyerEmail = buyer != null ? buyer.getEmail() : null;
        String buyerPhone = buyer != null ? buyer.getPhone() : null;
        String buyerCompany = null;

        String executiveName = null;
        if (r.getAssignedToUserId() != null) {
            executiveName = userRepository.findById(r.getAssignedToUserId())
                    .map(User::getName)
                    .orElse(null);
        }

        // 1. Status history (sanitized if buyer view)
        List<SourcingStatusHistory> historyList = sourcingStatusHistoryRepository.findBySourcingRequestIdOrderByCreatedAtDesc(r.getId());
        List<SourcingStatusHistoryDto> historyDtos = historyList.stream().map(h -> {
            String userName = null;
            if (!isBuyerView && h.getChangedByUserId() != null) {
                userName = userRepository.findById(h.getChangedByUserId()).map(User::getName).orElse(null);
            }
            return new SourcingStatusHistoryDto(
                    h.getId(),
                    h.getSourcingRequestId(),
                    h.getPreviousStatus(),
                    h.getNewStatus(),
                    isBuyerView ? null : h.getChangedByUserId(),
                    userName,
                    h.getReasonOrNotes(),
                    h.getCreatedAt()
            );
        }).toList();

        // 2. Assignments (hidden from buyers)
        List<SourcingAssignmentDto> assignmentDtos = Collections.emptyList();
        if (!isBuyerView) {
            List<SourcingAssignment> assignments = sourcingAssignmentRepository.findBySourcingRequestIdOrderByCreatedAtDesc(r.getId());
            assignmentDtos = assignments.stream().map(a -> {
                String assignedToName = userRepository.findById(a.getAssignedToUserId()).map(User::getName).orElse(null);
                String assignedByName = a.getAssignedByUserId() != null
                        ? userRepository.findById(a.getAssignedByUserId()).map(User::getName).orElse(null)
                        : null;
                return new SourcingAssignmentDto(
                        a.getId(),
                        a.getSourcingRequestId(),
                        a.getAssignedToUserId(),
                        assignedToName,
                        a.getAssignedByUserId(),
                        assignedByName,
                        a.getRole(),
                        a.getNotes(),
                        a.isActive(),
                        a.getCreatedAt(),
                        a.getUpdatedAt()
                );
            }).toList();
        }

        // 3. Suppliers (hidden from buyers)
        List<SourcingSupplierDto> supplierDtos = Collections.emptyList();
        Map<UUID, String> supplierNameMap = new HashMap<>();
        if (!isBuyerView) {
            List<SourcingSupplier> suppliers = sourcingSupplierRepository.findBySourcingRequestIdOrderByCreatedAtDesc(r.getId());
            supplierDtos = suppliers.stream().map(this::mapSupplierToDto).toList();
            supplierNameMap = suppliers.stream()
                    .collect(Collectors.toMap(SourcingSupplier::getId, SourcingSupplier::getSupplierName, (a, b) -> a));
        }

        // 4. Outreach Logs (hidden from buyers)
        List<SourcingOutreachLogDto> outreachDtos = Collections.emptyList();
        if (!isBuyerView) {
            List<SourcingOutreachLog> outreachLogs = sourcingOutreachLogRepository.findBySourcingRequestIdOrderByLoggedAtDesc(r.getId());
            final Map<UUID, String> sMap = supplierNameMap;
            outreachDtos = outreachLogs.stream()
                    .map(o -> mapOutreachLogToDto(o, sMap))
                    .toList();
        }

        // 5. Quotations (for buyers, only shareWithBuyer == true)
        List<SourcingQuotation> quotations = sourcingQuotationRepository.findBySourcingRequestIdOrderByCreatedAtDesc(r.getId());
        if (isBuyerView) {
            quotations = quotations.stream().filter(q -> Boolean.TRUE.equals(q.getShareWithBuyer())).toList();
        }
        final Map<UUID, String> finalSuppMap = supplierNameMap;
        List<SourcingQuotationDto> quotationDtos = quotations.stream().map(q -> {
            String suppName = q.getSourcingSupplierId() != null ? finalSuppMap.get(q.getSourcingSupplierId()) : null;
            return mapQuotationToDto(q, suppName, r.getTargetQuantity(), isBuyerView);
        }).toList();

        // 6. Proposals (for buyers, only published / decided)
        List<SourcingProposal> proposals = sourcingProposalRepository.findBySourcingRequestIdOrderByCreatedAtDesc(r.getId());
        if (isBuyerView) {
            proposals = proposals.stream()
                    .filter(p -> "PUBLISHED".equalsIgnoreCase(p.getStatus()) || "ACCEPTED".equalsIgnoreCase(p.getStatus()) || "COMPLETED".equalsIgnoreCase(p.getStatus()))
                    .toList();
        }
        List<SourcingProposalDto> proposalDtos = proposals.stream().map(p -> {
            List<SourcingProposalOption> options = sourcingProposalOptionRepository != null
                    ? sourcingProposalOptionRepository.findBySourcingProposalIdOrderByCreatedAtAsc(p.getId())
                    : Collections.emptyList();
            return mapProposalToDto(p, options, isBuyerView);
        }).toList();

        return new SourcingRequestDetailDto(
                r.getId(),
                r.getSourcingRequestReference(),
                r.getBuyerId(),
                buyerName,
                buyerEmail,
                buyerPhone,
                buyerCompany,
                r.getProductName(),
                r.getCasNumber(),
                r.getCategory(),
                r.getGrade(),
                r.getSpecifications(),
                r.getPharmacopeialStandard(),
                r.getTargetQuantity(),
                r.getUnit(),
                r.getDeliveryLocation(),
                r.getPackaging(),
                r.getTargetPrice(),
                r.getCurrency(),
                r.getExpectedDeliveryDate(),
                r.getAdditionalRequirements(),
                r.getAttachmentReferences(),
                r.getStatus(),
                r.getAssignedToUserId(),
                executiveName,
                r.getCreatedAt(),
                r.getUpdatedAt(),
                historyDtos,
                assignmentDtos,
                supplierDtos,
                outreachDtos,
                quotationDtos,
                proposalDtos
        );
    }
}
