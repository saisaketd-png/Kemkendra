package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.document.FileSecurityValidator;
import com.kemkendra.document.storage.StorageService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.invoice.dto.ConfirmPaymentRequest;
import com.kemkendra.invoice.dto.InvoiceDto;
import com.kemkendra.invoice.dto.InvoicePaymentRecordDto;
import com.kemkendra.invoice.dto.RecordPaymentRequest;
import com.kemkendra.invoice.dto.RejectPaymentRequest;
import com.kemkendra.invoice.dto.RequestPaymentInfoRequest;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationCategory;
import com.kemkendra.notification.NotificationEntityType;
import com.kemkendra.notification.NotificationPriority;
import com.kemkendra.notification.NotificationService;
import com.kemkendra.notification.NotificationType;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.seller.SupplierIdentityResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PaymentTrackingService {

    private static final Logger log = LoggerFactory.getLogger(PaymentTrackingService.class);
    private static final long MAX_PROOF_SIZE = 10 * 1024 * 1024; // 10MB

    private final InvoiceRepository invoiceRepository;
    private final InvoicePaymentRecordRepository paymentRecordRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final SupplierIdentityResolver supplierIdentityResolver;
    private final FileSecurityValidator fileSecurityValidator;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final com.kemkendra.notification.email.EmailNotificationService emailNotificationService;

    public PaymentTrackingService(
            InvoiceRepository invoiceRepository,
            InvoicePaymentRecordRepository paymentRecordRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            FileSecurityValidator fileSecurityValidator,
            StorageService storageService,
            NotificationService notificationService) {
        this(invoiceRepository, paymentRecordRepository, purchaseOrderRepository, userRepository, supplierIdentityResolver, fileSecurityValidator, storageService, notificationService, null);
    }

    @org.springframework.beans.factory.annotation.Autowired
    public PaymentTrackingService(
            InvoiceRepository invoiceRepository,
            InvoicePaymentRecordRepository paymentRecordRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            FileSecurityValidator fileSecurityValidator,
            StorageService storageService,
            NotificationService notificationService,
            @org.springframework.beans.factory.annotation.Autowired(required = false) com.kemkendra.notification.email.EmailNotificationService emailNotificationService) {
        this.invoiceRepository = invoiceRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.supplierIdentityResolver = supplierIdentityResolver;
        this.fileSecurityValidator = fileSecurityValidator;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.emailNotificationService = emailNotificationService;
    }

    public record ProofUploadResult(
            String fileName,
            long fileSize,
            String contentType,
            String storageKey
    ) {}

    public ProofUploadResult uploadPaymentProof(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Payment proof file cannot be empty");
        }

        FileSecurityValidator.ValidatedFileInfo validated = fileSecurityValidator.validate(file, MAX_PROOF_SIZE);
        String storageKey = "proofs/" + UUID.randomUUID() + validated.safeExtension();

        try {
            storageService.store(storageKey, file.getInputStream());
        } catch (IOException e) {
            log.error("Failed to store payment proof file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store payment proof file", e);
        }

        return new ProofUploadResult(
                validated.safeOriginalFilename(),
                validated.fileSize(),
                validated.validatedMimeType(),
                storageKey
        );
    }

    @Transactional
    public InvoiceDto recordPayment(UUID buyerId, UUID invoiceId, RecordPaymentRequest request, MultipartFile optionalFile) {
        Invoice invoice = invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot record payment for a cancelled invoice.");
        }

        BigDecimal paymentAmount = request.getAmountPaid().setScale(4, RoundingMode.HALF_UP);
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        // Partial payment check: Prevent overpayment beyond remaining balance
        BigDecimal confirmedPaid = invoice.getPaymentRecords().stream()
                .filter(r -> r.getStatus() == PaymentStatus.CONFIRMED)
                .map(InvoicePaymentRecord::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remainingBalance = invoice.getGrandTotal().subtract(confirmedPaid);

        if (paymentAmount.compareTo(remainingBalance) > 0) {
            throw new IllegalArgumentException(String.format(
                    "Payment amount (INR %s) exceeds remaining balance due (INR %s). Overpayment is not allowed.",
                    paymentAmount, remainingBalance
            ));
        }

        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setInvoice(invoice);
        record.setPurchaseOrderId(invoice.getPurchaseOrderId());
        record.setBuyerId(buyerId);
        record.setSupplierId(invoice.getSupplierId());
        record.setRecordedById(buyerId);
        record.setPaymentReference(request.getPaymentReference().trim());
        record.setPaymentMode(request.getPaymentMode());
        record.setPaymentDate(request.getPaymentDate());
        record.setAmountPaid(paymentAmount);
        record.setCurrency(request.getCurrency() != null ? request.getCurrency() : invoice.getCurrency());
        record.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        record.setBankName(request.getBankName() != null ? request.getBankName().trim() : null);
        record.setProofDocumentId(request.getProofDocumentId());

        if (optionalFile != null && !optionalFile.isEmpty()) {
            ProofUploadResult upload = uploadPaymentProof(optionalFile);
            record.setProofFileName(upload.fileName());
            record.setProofFileSize(upload.fileSize());
            record.setProofContentType(upload.contentType());
            record.setProofStorageKey(upload.storageKey());
        }

        record.setStatus(PaymentStatus.PROOF_UPLOADED);
        invoice.addPaymentRecord(record);

        if (invoice.getPaymentStatus() == PaymentStatus.PENDING) {
            invoice.setPaymentStatus(PaymentStatus.PROOF_UPLOADED);
        }

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                buyerId,
                "PAYMENT_RECORDED",
                String.format("Buyer recorded payment proof of INR %s via %s (Ref: %s)",
                        paymentAmount, request.getPaymentMode(), request.getPaymentReference())
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);

        // Notify Supplier
        if (invoice.getSupplierUserId() != null) {
            Notification n = notificationService.createNotification(
                    invoice.getSupplierUserId(),
                    NotificationType.PAYMENT_PROOF_UPLOADED,
                    NotificationCategory.PAYMENT,
                    NotificationPriority.HIGH,
                    "Payment Proof Uploaded",
                    String.format("Buyer recorded payment proof of INR %s for Invoice %s (Ref: %s).",
                            paymentAmount, invoice.getInvoiceNumber(), request.getPaymentReference()),
                    NotificationEntityType.INVOICE,
                    invoice.getId()
            );
            if (n != null && emailNotificationService != null) {
                emailNotificationService.sendNotificationEmail(n);
            }
        }

        return InvoiceService.mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto confirmPayment(UUID supplierUserId, UUID invoiceId, UUID paymentRecordId, ConfirmPaymentRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        InvoicePaymentRecord record = invoice.getPaymentRecords().stream()
                .filter(r -> r.getId().equals(paymentRecordId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + paymentRecordId));

        if (record.getStatus() == PaymentStatus.CONFIRMED) {
            throw new IllegalStateException("Payment record is already confirmed. Duplicate confirmation is prevented.");
        }

        record.setStatus(PaymentStatus.CONFIRMED);
        record.setReviewedById(supplierUserId);
        record.setReviewedAt(LocalDateTime.now());
        record.setConfirmedById(supplierUserId);
        record.setConfirmedAt(LocalDateTime.now());
        record.setReviewNotes(request != null ? request.getReviewNotes() : null);

        // Recalculate confirmed amount paid across all records
        BigDecimal totalConfirmedPaid = invoice.getPaymentRecords().stream()
                .filter(r -> r.getStatus() == PaymentStatus.CONFIRMED)
                .map(InvoicePaymentRecord::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(4, RoundingMode.HALF_UP);

        invoice.setAmountPaid(totalConfirmedPaid);
        BigDecimal due = invoice.getGrandTotal().subtract(totalConfirmedPaid).max(BigDecimal.ZERO).setScale(4, RoundingMode.HALF_UP);
        invoice.setAmountDue(due);

        if (due.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoice.setPaymentStatus(PaymentStatus.CONFIRMED);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
            invoice.setPaymentStatus(PaymentStatus.PROOF_UPLOADED);
        }

        // Synchronize Purchase Order
        if (invoice.getPurchaseOrderId() != null) {
            purchaseOrderRepository.findById(invoice.getPurchaseOrderId()).ifPresent(po -> {
                po.setAmountPaid(totalConfirmedPaid);
                if (due.compareTo(BigDecimal.ZERO) <= 0) {
                    po.setPaymentStatus("CONFIRMED");
                    po.setPaymentSettledAt(LocalDateTime.now());
                } else {
                    po.setPaymentStatus("PARTIALLY_PAID");
                }
                purchaseOrderRepository.save(po);
            });
        }

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "PAYMENT_CONFIRMED",
                String.format("Supplier confirmed receipt of payment INR %s (Ref: %s). New balance due: INR %s",
                        record.getAmountPaid(), record.getPaymentReference(), due)
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);

        // Notify Buyer
        Notification nc = notificationService.createNotification(
                invoice.getBuyerId(),
                NotificationType.PAYMENT_CONFIRMED,
                NotificationCategory.PAYMENT,
                NotificationPriority.NORMAL,
                "Payment Confirmed",
                String.format("Supplier confirmed receipt of payment INR %s for Invoice %s. Remaining balance: INR %s",
                        record.getAmountPaid(), invoice.getInvoiceNumber(), due),
                NotificationEntityType.INVOICE,
                invoice.getId()
        );
        if (nc != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(nc);
        }

        return InvoiceService.mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto rejectPayment(UUID supplierUserId, UUID invoiceId, UUID paymentRecordId, RejectPaymentRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        InvoicePaymentRecord record = invoice.getPaymentRecords().stream()
                .filter(r -> r.getId().equals(paymentRecordId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + paymentRecordId));

        if (record.getStatus() == PaymentStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot reject an already confirmed payment record.");
        }

        record.setStatus(PaymentStatus.FAILED);
        record.setReviewedById(supplierUserId);
        record.setReviewedAt(LocalDateTime.now());
        record.setRejectionReason(request.getRejectionReason());

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "PAYMENT_REJECTED",
                "Supplier rejected payment reference " + record.getPaymentReference() + ". Reason: " + request.getRejectionReason()
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);

        // Notify Buyer
        Notification nr = notificationService.createNotification(
                invoice.getBuyerId(),
                NotificationType.PAYMENT_REJECTED,
                NotificationCategory.PAYMENT,
                NotificationPriority.HIGH,
                "Payment Rejected",
                String.format("Supplier rejected payment reference %s for Invoice %s. Reason: %s",
                        record.getPaymentReference(), invoice.getInvoiceNumber(), request.getRejectionReason()),
                NotificationEntityType.INVOICE,
                invoice.getId()
        );
        if (nr != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(nr);
        }

        return InvoiceService.mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto requestPaymentInfo(UUID supplierUserId, UUID invoiceId, UUID paymentRecordId, RequestPaymentInfoRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        InvoicePaymentRecord record = invoice.getPaymentRecords().stream()
                .filter(r -> r.getId().equals(paymentRecordId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + paymentRecordId));

        record.setInfoRequestedNotes(request.getMessage());
        record.setReviewedById(supplierUserId);
        record.setReviewedAt(LocalDateTime.now());

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "INFO_REQUESTED",
                "Supplier requested additional information for payment " + record.getPaymentReference() + ": " + request.getMessage()
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);

        // Notify Buyer
        Notification ni = notificationService.createNotification(
                invoice.getBuyerId(),
                NotificationType.PAYMENT_INFO_REQUESTED,
                NotificationCategory.PAYMENT,
                NotificationPriority.NORMAL,
                "Information Requested on Payment",
                String.format("Supplier requested clarification on payment for Invoice %s: %s",
                        invoice.getInvoiceNumber(), request.getMessage()),
                NotificationEntityType.INVOICE,
                invoice.getId()
        );
        if (ni != null && emailNotificationService != null) {
            emailNotificationService.sendNotificationEmail(ni);
        }

        return InvoiceService.mapToInvoiceDto(saved);
    }

    @Transactional(readOnly = true)
    public record PaymentProofDownload(
            Resource resource,
            String fileName,
            String contentType
    ) {}

    @Transactional(readOnly = true)
    public PaymentProofDownload loadPaymentProof(UUID paymentRecordId, User caller) {
        InvoicePaymentRecord record = paymentRecordRepository.findById(paymentRecordId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + paymentRecordId));

        boolean isBuyer = record.getBuyerId() != null && record.getBuyerId().equals(caller.getId());
        boolean isAdmin = caller.getRole() != null && caller.getRole().name().equals("ADMIN");
        boolean isSupplier = false;

        if (caller.getRole() != null && caller.getRole().name().equals("SUPPLIER")) {
            try {
                Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(caller);
                isSupplier = record.getSupplierId() != null && record.getSupplierId().equals(supplier.getId());
            } catch (Exception ignored) {
            }
        }

        // IDOR Protection: Must be buyer, supplier, or admin
        if (!isBuyer && !isSupplier && !isAdmin) {
            throw new ResourceNotFoundException("Payment record not found: " + paymentRecordId);
        }

        if (record.getProofStorageKey() == null) {
            throw new ResourceNotFoundException("No proof document stored for payment: " + paymentRecordId);
        }

        Resource resource = storageService.loadAsResource(record.getProofStorageKey());
        String fileName = record.getProofFileName() != null ? record.getProofFileName() : "payment-proof.pdf";
        String contentType = record.getProofContentType() != null ? record.getProofContentType() : "application/octet-stream";

        return new PaymentProofDownload(resource, fileName, contentType);
    }
}
