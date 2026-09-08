package com.kemkendra.dispute;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dispute.dto.*;
import com.kemkendra.document.FileSecurityValidator;
import com.kemkendra.document.storage.StorageService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.invoice.Invoice;
import com.kemkendra.invoice.InvoiceRepository;
import com.kemkendra.notification.*;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.seller.SupplierIdentityResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DisputeService {

    private static final Logger log = LoggerFactory.getLogger(DisputeService.class);
    private static final long MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024; // 10MB
    private final SecureRandom random = new SecureRandom();

    private final DisputeRepository disputeRepository;
    private final DisputeAttachmentRepository attachmentRepository;
    private final DisputeTimelineEventRepository timelineEventRepository;
    private final InvoiceRepository invoiceRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final SupplierIdentityResolver supplierIdentityResolver;
    private final FileSecurityValidator fileSecurityValidator;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final com.kemkendra.notification.email.EmailNotificationService emailNotificationService;

    public DisputeService(
            DisputeRepository disputeRepository,
            DisputeAttachmentRepository attachmentRepository,
            DisputeTimelineEventRepository timelineEventRepository,
            InvoiceRepository invoiceRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            FileSecurityValidator fileSecurityValidator,
            StorageService storageService,
            NotificationService notificationService) {
        this(disputeRepository, attachmentRepository, timelineEventRepository, invoiceRepository,
                purchaseOrderRepository, userRepository, supplierIdentityResolver, fileSecurityValidator,
                storageService, notificationService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public DisputeService(
            DisputeRepository disputeRepository,
            DisputeAttachmentRepository attachmentRepository,
            DisputeTimelineEventRepository timelineEventRepository,
            InvoiceRepository invoiceRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            FileSecurityValidator fileSecurityValidator,
            StorageService storageService,
            NotificationService notificationService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.kemkendra.notification.email.EmailNotificationService emailNotificationService) {
        this.disputeRepository = disputeRepository;
        this.attachmentRepository = attachmentRepository;
        this.timelineEventRepository = timelineEventRepository;
        this.invoiceRepository = invoiceRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.supplierIdentityResolver = supplierIdentityResolver;
        this.fileSecurityValidator = fileSecurityValidator;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.emailNotificationService = emailNotificationService;
    }

    private String generateDisputeNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
        int rand = 1000 + random.nextInt(9000);
        return "DSP-" + datePart + "-" + rand;
    }

    @Transactional
    public DisputeDto createDispute(UUID buyerId, CreateDisputeRequest request, List<MultipartFile> files) {
        Dispute dispute = new Dispute();
        dispute.setDisputeNumber(generateDisputeNumber());
        dispute.setBuyerId(buyerId);
        dispute.setRaisedById(buyerId);
        dispute.setRaisedByRole("BUYER");
        dispute.setReason(request.getReason());
        dispute.setDescription(request.getDescription().trim());
        dispute.setStatus(DisputeStatus.OPEN);

        Long supplierId = null;
        UUID supplierUserId = null;

        if (request.getInvoiceId() != null) {
            Invoice invoice = invoiceRepository.findByIdAndBuyerId(request.getInvoiceId(), buyerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + request.getInvoiceId()));
            dispute.setInvoiceId(invoice.getId());
            dispute.setInvoiceNumber(invoice.getInvoiceNumber());
            dispute.setPurchaseOrderId(invoice.getPurchaseOrderId());
            dispute.setPoNumber(invoice.getPoNumber());
            dispute.setSupplierId(invoice.getSupplierId());
            supplierId = invoice.getSupplierId();
            supplierUserId = invoice.getSupplierUserId();
        } else if (request.getPurchaseOrderId() != null) {
            PurchaseOrder po = purchaseOrderRepository.findByIdAndBuyerId(request.getPurchaseOrderId(), buyerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found: " + request.getPurchaseOrderId()));
            dispute.setPurchaseOrderId(po.getId());
            dispute.setPoNumber(po.getPoNumber());
            dispute.setSupplierId(po.getSupplierId());
            supplierId = po.getSupplierId();
        } else {
            throw new IllegalArgumentException("Either invoiceId or purchaseOrderId must be provided to create a dispute.");
        }

        if (supplierId == null) {
            throw new IllegalArgumentException("Supplier association could not be resolved for dispute.");
        }
        dispute.setSupplierId(supplierId);
        dispute.setPaymentRecordId(request.getPaymentRecordId());

        // Process attachments
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                FileSecurityValidator.ValidatedFileInfo validated = fileSecurityValidator.validate(file, MAX_ATTACHMENT_SIZE);
                String storageKey = "disputes/" + UUID.randomUUID() + validated.safeExtension();
                try {
                    storageService.store(storageKey, file.getInputStream());
                    DisputeAttachment attachment = new DisputeAttachment(
                            dispute,
                            buyerId,
                            validated.safeOriginalFilename(),
                            validated.fileSize(),
                            validated.validatedMimeType(),
                            storageKey
                    );
                    dispute.addAttachment(attachment);
                } catch (IOException e) {
                    log.error("Failed to store dispute attachment: {}", e.getMessage());
                }
            }
        }

        DisputeTimelineEvent initialEvent = new DisputeTimelineEvent(
                dispute,
                buyerId,
                "CREATED",
                "Dispute raised by buyer. Reason: " + request.getReason(),
                null,
                DisputeStatus.OPEN.name()
        );
        dispute.addTimelineEvent(initialEvent);

        Dispute saved = disputeRepository.save(dispute);

        // Link and transition Purchase Order to DISPUTED status if applicable
        if (saved.getPurchaseOrderId() != null) {
            purchaseOrderRepository.findById(saved.getPurchaseOrderId()).ifPresent(po -> {
                po.setStatus(com.kemkendra.order.OrderStatus.DISPUTED);
                po.setDisputedAt(java.time.LocalDateTime.now());
                po.setDisputedBy(buyerId.toString());
                po.setDisputeId(saved.getId());
                purchaseOrderRepository.save(po);
            });
        }

        // Notify Supplier
        if (supplierUserId != null) {
            Notification n = notificationService.createNotification(
                    supplierUserId,
                    NotificationType.DISPUTE_CREATED,
                    NotificationCategory.DISPUTE,
                    NotificationPriority.HIGH,
                    "Commercial Dispute Raised",
                    String.format("Buyer raised dispute %s for reference %s. Reason: %s",
                            saved.getDisputeNumber(),
                            saved.getInvoiceNumber() != null ? saved.getInvoiceNumber() : saved.getPoNumber(),
                            saved.getReason()),
                    NotificationEntityType.DISPUTE,
                    saved.getId()
            );
            if (n != null && emailNotificationService != null) {
                emailNotificationService.sendNotificationEmail(n);
            }
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public DisputeDto getDisputeForBuyer(UUID buyerId, UUID disputeId) {
        Dispute dispute = disputeRepository.findByIdAndBuyerId(disputeId, buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));
        return mapToDto(dispute);
    }

    @Transactional(readOnly = true)
    public DisputeDto getDisputeForSupplier(UUID supplierUserId, UUID disputeId) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Dispute dispute = disputeRepository.findByIdAndSupplierId(disputeId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));
        return mapToDto(dispute);
    }

    @Transactional(readOnly = true)
    public DisputeDto getDisputeForAdmin(UUID disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));
        return mapToDto(dispute);
    }

    @Transactional(readOnly = true)
    public Page<DisputeDto> listDisputesForBuyer(UUID buyerId, DisputeStatus status, Pageable pageable) {
        Page<Dispute> page = (status != null)
                ? disputeRepository.findByBuyerIdAndStatus(buyerId, status, pageable)
                : disputeRepository.findByBuyerId(buyerId, pageable);
        return page.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<DisputeDto> listDisputesForSupplier(UUID supplierUserId, DisputeStatus status, Pageable pageable) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Page<Dispute> page = (status != null)
                ? disputeRepository.findBySupplierIdAndStatus(supplier.getId(), status, pageable)
                : disputeRepository.findBySupplierId(supplier.getId(), pageable);
        return page.map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public Page<DisputeDto> listDisputesForAdmin(DisputeStatus status, Pageable pageable) {
        Page<Dispute> page = (status != null)
                ? disputeRepository.findByStatus(status, pageable)
                : disputeRepository.findAll(pageable);
        return page.map(this::mapToDto);
    }

    @Transactional
    public DisputeDto respondToDispute(UUID userId, UUID disputeId, RespondDisputeRequest request, List<MultipartFile> files) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        boolean isBuyer = dispute.getBuyerId().equals(userId);
        boolean isAdmin = user.getRole() != null && user.getRole().name().equals("ADMIN");
        boolean isSupplier = false;

        if (user.getRole() != null && user.getRole().name().equals("SUPPLIER")) {
            try {
                Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(user);
                isSupplier = dispute.getSupplierId().equals(supplier.getId());
            } catch (Exception ignored) {
            }
        }

        if (!isBuyer && !isSupplier && !isAdmin) {
            throw new ResourceNotFoundException("Dispute not found: " + disputeId);
        }

        // Process attachments
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;
                FileSecurityValidator.ValidatedFileInfo validated = fileSecurityValidator.validate(file, MAX_ATTACHMENT_SIZE);
                String storageKey = "disputes/" + UUID.randomUUID() + validated.safeExtension();
                try {
                    storageService.store(storageKey, file.getInputStream());
                    DisputeAttachment attachment = new DisputeAttachment(
                            dispute,
                            userId,
                            validated.safeOriginalFilename(),
                            validated.fileSize(),
                            validated.validatedMimeType(),
                            storageKey
                    );
                    dispute.addAttachment(attachment);
                } catch (IOException e) {
                    log.error("Failed to store dispute attachment: {}", e.getMessage());
                }
            }
        }

        String prevStatus = dispute.getStatus().name();
        if (dispute.getStatus() == DisputeStatus.WAITING_FOR_INFORMATION) {
            dispute.setStatus(DisputeStatus.UNDER_REVIEW);
        }

        DisputeTimelineEvent event = new DisputeTimelineEvent(
                dispute,
                userId,
                "MESSAGE_POSTED",
                request.getMessage().trim(),
                prevStatus,
                dispute.getStatus().name()
        );
        dispute.addTimelineEvent(event);

        Dispute saved = disputeRepository.save(dispute);

        // Notify Counterpart
        UUID notifyTarget = isBuyer ? null : dispute.getBuyerId();
        if (notifyTarget != null) {
            Notification nu = notificationService.createNotification(
                    notifyTarget,
                    NotificationType.DISPUTE_UPDATED,
                    NotificationCategory.DISPUTE,
                    NotificationPriority.NORMAL,
                    "New Response on Dispute " + saved.getDisputeNumber(),
                    "A new message was posted: " + request.getMessage(),
                    NotificationEntityType.DISPUTE,
                    saved.getId()
            );
            if (nu != null && emailNotificationService != null) {
                emailNotificationService.sendNotificationEmail(nu);
            }
        }

        return mapToDto(saved);
    }

    @Transactional
    public DisputeDto assignDispute(UUID adminId, UUID disputeId, AssignDisputeRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        User assignee = userRepository.findById(request.getAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found: " + request.getAdminId()));

        dispute.setAssignedAdminId(assignee.getId());
        dispute.setStatus(DisputeStatus.UNDER_REVIEW);

        DisputeTimelineEvent event = new DisputeTimelineEvent(
                dispute,
                adminId,
                "ADMIN_ASSIGNED",
                "Dispute assigned to admin " + assignee.getEmail(),
                DisputeStatus.OPEN.name(),
                DisputeStatus.UNDER_REVIEW.name()
        );
        dispute.addTimelineEvent(event);

        Dispute saved = disputeRepository.save(dispute);
        return mapToDto(saved);
    }

    @Transactional
    public DisputeDto updateDisputeStatus(UUID adminId, UUID disputeId, UpdateDisputeStatusRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        String prev = dispute.getStatus().name();
        dispute.setStatus(request.getStatus());

        DisputeTimelineEvent event = new DisputeTimelineEvent(
                dispute,
                adminId,
                "STATUS_UPDATED",
                request.getNotes() != null ? request.getNotes() : "Status updated to " + request.getStatus(),
                prev,
                request.getStatus().name()
        );
        dispute.addTimelineEvent(event);

        Dispute saved = disputeRepository.save(dispute);

        // Notify Buyer
        Notification nsu = notificationService.createNotification(
                dispute.getBuyerId(),
                NotificationType.DISPUTE_UPDATED,
                NotificationCategory.DISPUTE,
                NotificationPriority.NORMAL,
                "Dispute Status Updated",
                String.format("Dispute %s status changed to %s", saved.getDisputeNumber(), saved.getStatus()),
                NotificationEntityType.DISPUTE,
                saved.getId()
        );
        if (nsu != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(nsu);
        }

        return mapToDto(saved);
    }

    @Transactional
    public DisputeDto resolveDispute(UUID adminId, UUID disputeId, ResolveDisputeRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        String prev = dispute.getStatus().name();
        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolutionNotes(request.getResolutionNotes().trim());
        dispute.setResolvedById(adminId);
        dispute.setResolvedAt(LocalDateTime.now());

        DisputeTimelineEvent event = new DisputeTimelineEvent(
                dispute,
                adminId,
                "RESOLVED",
                "Dispute resolved by admin: " + request.getResolutionNotes(),
                prev,
                DisputeStatus.RESOLVED.name()
        );
        dispute.addTimelineEvent(event);

        Dispute saved = disputeRepository.save(dispute);

        // Notify Buyer
        Notification nres = notificationService.createNotification(
                dispute.getBuyerId(),
                NotificationType.DISPUTE_RESOLVED,
                NotificationCategory.DISPUTE,
                NotificationPriority.HIGH,
                "Dispute Resolved",
                String.format("Dispute %s has been resolved: %s", saved.getDisputeNumber(), request.getResolutionNotes()),
                NotificationEntityType.DISPUTE,
                saved.getId()
        );
        if (nres != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(nres);
        }

        return mapToDto(saved);
    }

    @Transactional
    public DisputeDto rejectDispute(UUID adminId, UUID disputeId, ResolveDisputeRequest request) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found: " + disputeId));

        String prev = dispute.getStatus().name();
        dispute.setStatus(DisputeStatus.REJECTED);
        dispute.setResolutionNotes(request.getResolutionNotes().trim());
        dispute.setResolvedById(adminId);
        dispute.setResolvedAt(LocalDateTime.now());

        DisputeTimelineEvent event = new DisputeTimelineEvent(
                dispute,
                adminId,
                "REJECTED",
                "Dispute rejected by admin: " + request.getResolutionNotes(),
                prev,
                DisputeStatus.REJECTED.name()
        );
        dispute.addTimelineEvent(event);

        Dispute saved = disputeRepository.save(dispute);

        // Notify Buyer
        Notification nrej = notificationService.createNotification(
                dispute.getBuyerId(),
                NotificationType.DISPUTE_REJECTED,
                NotificationCategory.DISPUTE,
                NotificationPriority.NORMAL,
                "Dispute Rejected",
                String.format("Dispute %s has been rejected: %s", saved.getDisputeNumber(), request.getResolutionNotes()),
                NotificationEntityType.DISPUTE,
                saved.getId()
        );
        if (nrej != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(nrej);
        }

        return mapToDto(saved);
    }

    private DisputeDto mapToDto(Dispute dispute) {
        DisputeDto dto = new DisputeDto();
        dto.setId(dispute.getId());
        dto.setDisputeNumber(dispute.getDisputeNumber());
        dto.setInvoiceId(dispute.getInvoiceId());
        dto.setInvoiceNumber(dispute.getInvoiceNumber());
        dto.setPurchaseOrderId(dispute.getPurchaseOrderId());
        dto.setPoNumber(dispute.getPoNumber());
        dto.setPaymentRecordId(dispute.getPaymentRecordId());
        dto.setBuyerId(dispute.getBuyerId());
        dto.setSupplierId(dispute.getSupplierId());
        dto.setRaisedById(dispute.getRaisedById());
        dto.setRaisedByRole(dispute.getRaisedByRole());
        dto.setReason(dispute.getReason());
        dto.setDescription(dispute.getDescription());
        dto.setStatus(dispute.getStatus());
        dto.setAssignedAdminId(dispute.getAssignedAdminId());
        dto.setResolutionNotes(dispute.getResolutionNotes());
        dto.setResolvedById(dispute.getResolvedById());
        dto.setResolvedAt(dispute.getResolvedAt());
        dto.setCreatedAt(dispute.getCreatedAt());
        dto.setUpdatedAt(dispute.getUpdatedAt());

        if (dispute.getAttachments() != null) {
            dto.setAttachments(dispute.getAttachments().stream().map(a -> {
                DisputeAttachmentDto att = new DisputeAttachmentDto();
                att.setId(a.getId());
                att.setUploadedById(a.getUploadedById());
                att.setDocumentId(a.getDocumentId());
                att.setFileName(a.getFileName());
                att.setFileSize(a.getFileSize());
                att.setContentType(a.getContentType());
                att.setCreatedAt(a.getCreatedAt());
                return att;
            }).collect(Collectors.toList()));
        }

        if (dispute.getTimelineEvents() != null) {
            dto.setTimelineEvents(dispute.getTimelineEvents().stream().map(e -> {
                DisputeTimelineEventDto tev = new DisputeTimelineEventDto();
                tev.setId(e.getId());
                tev.setActorId(e.getActorId());
                tev.setAction(e.getAction());
                tev.setMessage(e.getMessage());
                tev.setPreviousStatus(e.getPreviousStatus());
                tev.setNewStatus(e.getNewStatus());
                tev.setCreatedAt(e.getCreatedAt());
                return tev;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
