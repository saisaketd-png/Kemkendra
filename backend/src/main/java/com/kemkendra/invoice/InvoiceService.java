package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.invoice.dto.*;
import com.kemkendra.order.OrderStatus;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.seller.SupplierIdentityResolver;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationCategory;
import com.kemkendra.notification.NotificationEntityType;
import com.kemkendra.notification.NotificationPriority;
import com.kemkendra.notification.NotificationService;
import com.kemkendra.notification.NotificationType;
import com.kemkendra.notification.email.EmailNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class InvoiceService {

    private final BusinessTaxProfileRepository taxProfileRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository itemRepository;
    private final InvoicePaymentRecordRepository paymentRecordRepository;
    private final InvoiceAuditRepository auditRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierIdentityResolver supplierIdentityResolver;
    private final GstCalculationService gstCalculationService;
    private final InvoiceNumberService invoiceNumberService;
    private final InvoicePdfGenerator invoicePdfGenerator;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;

    public InvoiceService(
            BusinessTaxProfileRepository taxProfileRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemRepository itemRepository,
            InvoicePaymentRecordRepository paymentRecordRepository,
            InvoiceAuditRepository auditRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            GstCalculationService gstCalculationService,
            InvoiceNumberService invoiceNumberService,
            InvoicePdfGenerator invoicePdfGenerator
    ) {
        this(taxProfileRepository, invoiceRepository, itemRepository, paymentRecordRepository,
                auditRepository, purchaseOrderRepository, userRepository, supplierRepository,
                supplierIdentityResolver, gstCalculationService, invoiceNumberService, invoicePdfGenerator,
                null, null);
    }

    @Autowired
    public InvoiceService(
            BusinessTaxProfileRepository taxProfileRepository,
            InvoiceRepository invoiceRepository,
            InvoiceItemRepository itemRepository,
            InvoicePaymentRecordRepository paymentRecordRepository,
            InvoiceAuditRepository auditRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            UserRepository userRepository,
            SupplierRepository supplierRepository,
            SupplierIdentityResolver supplierIdentityResolver,
            GstCalculationService gstCalculationService,
            InvoiceNumberService invoiceNumberService,
            InvoicePdfGenerator invoicePdfGenerator,
            @Autowired(required = false) NotificationService notificationService,
            @Autowired(required = false) EmailNotificationService emailNotificationService
    ) {
        this.taxProfileRepository = taxProfileRepository;
        this.invoiceRepository = invoiceRepository;
        this.itemRepository = itemRepository;
        this.paymentRecordRepository = paymentRecordRepository;
        this.auditRepository = auditRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.supplierIdentityResolver = supplierIdentityResolver;
        this.gstCalculationService = gstCalculationService;
        this.invoiceNumberService = invoiceNumberService;
        this.invoicePdfGenerator = invoicePdfGenerator;
        this.notificationService = notificationService;
        this.emailNotificationService = emailNotificationService;
    }

    // ==========================================
    // 1. Business Tax Profile Management
    // ==========================================

    @Transactional(readOnly = true)
    public BusinessTaxProfileDto getTaxProfile(UUID userId) {
        return taxProfileRepository.findByUserId(userId)
                .map(this::mapToTaxProfileDto)
                .orElse(null);
    }

    @Transactional
    public BusinessTaxProfileDto saveTaxProfile(UUID userId, BusinessTaxProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        // Validation for GSTIN
        if (Boolean.TRUE.equals(dto.getIsGstRegistered()) || (dto.getGstin() != null && !dto.getGstin().isBlank())) {
            String gstin = dto.getGstin() != null ? dto.getGstin().trim().toUpperCase() : "";
            if (!gstCalculationService.isValidGstin(gstin)) {
                throw new IllegalArgumentException("Invalid GSTIN format or invalid state code in GSTIN.");
            }
            String gstinStateCode = gstCalculationService.extractStateCode(gstin);
            if (dto.getStateCode() != null && !dto.getStateCode().trim().equals(gstinStateCode)) {
                throw new IllegalArgumentException("State code does not match GSTIN state prefix: " + gstinStateCode);
            }
            dto.setGstin(gstin);
            dto.setIsGstRegistered(true);
            if (dto.getGstRegistrationType() == null || dto.getGstRegistrationType() == GstRegistrationType.UNREGISTERED) {
                dto.setGstRegistrationType(GstRegistrationType.REGISTERED_REGULAR);
            }
        } else {
            dto.setIsGstRegistered(false);
            if (dto.getGstRegistrationType() == null) {
                dto.setGstRegistrationType(GstRegistrationType.UNREGISTERED);
            }
        }

        BusinessTaxProfile profile = taxProfileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    BusinessTaxProfile newProfile = new BusinessTaxProfile();
                    newProfile.setUserId(userId);
                    return newProfile;
                });

        profile.setLegalBusinessName(dto.getLegalBusinessName().trim());
        profile.setTradeName(dto.getTradeName() != null ? dto.getTradeName().trim() : null);
        profile.setGstin(dto.getGstin());
        profile.setIsGstRegistered(dto.getIsGstRegistered());
        profile.setGstRegistrationType(dto.getGstRegistrationType());
        profile.setPanNumber(dto.getPanNumber() != null ? dto.getPanNumber().trim().toUpperCase() : null);
        profile.setRegisteredAddress(dto.getRegisteredAddress().trim());
        profile.setCity(dto.getCity().trim());
        profile.setState(dto.getState().trim());
        profile.setStateCode(dto.getStateCode().trim());
        profile.setPostalCode(dto.getPostalCode().trim());
        profile.setCountry(dto.getCountry() != null ? dto.getCountry().trim() : "India");

        BusinessTaxProfile saved = taxProfileRepository.save(profile);
        return mapToTaxProfileDto(saved);
    }

    // ==========================================
    // 2. Invoice Creation from Purchase Order
    // ==========================================

    @Transactional
    public InvoiceDto issueInvoiceFromOrder(UUID supplierUserId, IssueInvoiceRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));

        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        PurchaseOrder po = purchaseOrderRepository.findById(request.getPurchaseOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found: " + request.getPurchaseOrderId()));

        // IDOR Check
        if (!po.getSupplierId().equals(supplier.getId())) {
            throw new ResourceNotFoundException("Purchase Order not found: " + request.getPurchaseOrderId());
        }

        // Validate PO status
        if (po.getStatus() == OrderStatus.REJECTED || po.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot issue an invoice for a cancelled or rejected purchase order.");
        }

        // Check for existing active invoice
        List<Invoice> existingInvoices = invoiceRepository.findByPurchaseOrderId(po.getId());
        boolean hasActiveInvoice = existingInvoices.stream()
                .anyMatch(inv -> inv.getStatus() != InvoiceStatus.CANCELLED);
        if (hasActiveInvoice) {
            Invoice active = existingInvoices.stream()
                    .filter(inv -> inv.getStatus() != InvoiceStatus.CANCELLED)
                    .findFirst().orElseThrow();
            throw new IllegalStateException("An active invoice already exists for this order: " + active.getInvoiceNumber());
        }

        LocalDate invoiceDate = request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : invoiceDate.plusDays(30);

        String financialYear = invoiceNumberService.calculateFinancialYear(invoiceDate);
        String invoiceNumber = invoiceNumberService.generateInvoiceNumber(invoiceDate);

        // Fetch supplier tax details snapshot
        Optional<BusinessTaxProfile> supplierTaxOpt = taxProfileRepository.findByUserId(supplierUserId);
        String supplierLegalName = supplierTaxOpt.map(BusinessTaxProfile::getLegalBusinessName)
                .orElse(supplier.getLegalName() != null ? supplier.getLegalName() : supplier.getName());
        String supplierTradeName = supplierTaxOpt.map(BusinessTaxProfile::getTradeName)
                .orElse(supplier.getTradeName() != null ? supplier.getTradeName() : supplier.getName());
        String supplierGstin = supplierTaxOpt.map(BusinessTaxProfile::getGstin)
                .orElse(supplier.getTaxVatNumber());
        String supplierPan = supplierTaxOpt.map(BusinessTaxProfile::getPanNumber).orElse(null);
        String supplierAddress = supplierTaxOpt.map(BusinessTaxProfile::getRegisteredAddress)
                .orElse(supplier.getRegisteredAddress() != null ? supplier.getRegisteredAddress() : "N/A");
        String supplierCity = supplierTaxOpt.map(BusinessTaxProfile::getCity)
                .orElse(supplier.getCity());
        String supplierState = supplierTaxOpt.map(BusinessTaxProfile::getState)
                .orElse(supplier.getStateProvince() != null ? supplier.getStateProvince() : "Maharashtra");
        String supplierStateCode = supplierTaxOpt.map(BusinessTaxProfile::getStateCode)
                .orElse("27");
        String supplierPostalCode = supplierTaxOpt.map(BusinessTaxProfile::getPostalCode)
                .orElse(supplier.getPostalCode());
        String supplierEmail = supplier.getBusinessEmail() != null ? supplier.getBusinessEmail() : supplierUser.getEmail();
        String supplierPhone = supplier.getBusinessPhone() != null ? supplier.getBusinessPhone() : supplierUser.getPhone();

        // Fetch buyer tax details snapshot
        User buyerUser = userRepository.findById(po.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer user not found"));
        Optional<BusinessTaxProfile> buyerTaxOpt = taxProfileRepository.findByUserId(po.getBuyerId());
        String buyerLegalName = buyerTaxOpt.map(BusinessTaxProfile::getLegalBusinessName)
                .orElse(buyerUser.getName());
        String buyerTradeName = buyerTaxOpt.map(BusinessTaxProfile::getTradeName)
                .orElse(buyerUser.getName());
        String buyerGstin = buyerTaxOpt.map(BusinessTaxProfile::getGstin).orElse(null);
        String buyerPan = buyerTaxOpt.map(BusinessTaxProfile::getPanNumber).orElse(null);
        String buyerBillingAddress = buyerTaxOpt.map(BusinessTaxProfile::getRegisteredAddress)
                .orElse(po.getBillingContact() != null ? po.getBillingContact() : po.getShippingAddress());
        String buyerShippingAddress = po.getShippingAddress();
        String buyerCity = buyerTaxOpt.map(BusinessTaxProfile::getCity).orElse(null);
        String buyerState = buyerTaxOpt.map(BusinessTaxProfile::getState).orElse("Maharashtra");
        String buyerStateCode = buyerTaxOpt.map(BusinessTaxProfile::getStateCode).orElse("27");
        String buyerPostalCode = buyerTaxOpt.map(BusinessTaxProfile::getPostalCode).orElse(null);
        String buyerEmail = buyerUser.getEmail();
        String buyerPhone = buyerUser.getPhone();

        boolean isInterstate = gstCalculationService.isInterstate(supplierStateCode, buyerStateCode);

        // Build Invoice entity
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setFinancialYear(financialYear);
        invoice.setInvoiceDate(invoiceDate);
        invoice.setDueDate(dueDate);
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        // References
        invoice.setPurchaseOrderId(po.getId());
        invoice.setPoNumber(po.getPoNumber());
        invoice.setRfqId(po.getRfqId());
        invoice.setRfqReference(po.getRfqReference());
        invoice.setQuotationId(po.getQuotationId());
        invoice.setQuotationReference(po.getQuotationReference());

        // Supplier Snapshot
        invoice.setSupplierId(supplier.getId());
        invoice.setSupplierUserId(supplierUserId);
        invoice.setSupplierLegalName(supplierLegalName);
        invoice.setSupplierTradeName(supplierTradeName);
        invoice.setSupplierGstin(supplierGstin);
        invoice.setSupplierPan(supplierPan);
        invoice.setSupplierAddress(supplierAddress);
        invoice.setSupplierCity(supplierCity);
        invoice.setSupplierState(supplierState);
        invoice.setSupplierStateCode(supplierStateCode);
        invoice.setSupplierPostalCode(supplierPostalCode);
        invoice.setSupplierEmail(supplierEmail);
        invoice.setSupplierPhone(supplierPhone);

        // Buyer Snapshot
        invoice.setBuyerId(buyerUser.getId());
        invoice.setBuyerLegalName(buyerLegalName);
        invoice.setBuyerTradeName(buyerTradeName);
        invoice.setBuyerGstin(buyerGstin);
        invoice.setBuyerPan(buyerPan);
        invoice.setBuyerBillingAddress(buyerBillingAddress);
        invoice.setBuyerShippingAddress(buyerShippingAddress);
        invoice.setBuyerCity(buyerCity);
        invoice.setBuyerState(buyerState);
        invoice.setBuyerStateCode(buyerStateCode);
        invoice.setBuyerPostalCode(buyerPostalCode);
        invoice.setBuyerEmail(buyerEmail);
        invoice.setBuyerPhone(buyerPhone);

        // Supply Determination
        invoice.setIsInterstate(isInterstate);
        invoice.setPlaceOfSupplyState(buyerState);
        invoice.setPlaceOfSupplyStateCode(buyerStateCode);
        invoice.setCurrency(po.getCurrency() != null ? po.getCurrency() : "INR");

        // Line Item Tax Calculation
        BigDecimal gstRate = request.getGstRate() != null ? request.getGstRate() : new BigDecimal("18.00");
        String hsnCode = request.getHsnCode() != null && !request.getHsnCode().isBlank() ? request.getHsnCode() : "2901";
        BigDecimal itemDiscount = request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal additionalCharges = request.getAdditionalCharges() != null ? request.getAdditionalCharges() : BigDecimal.ZERO;

        GstCalculationService.TaxCalculationResult taxCalc = gstCalculationService.calculateItemTax(
                po.getQuantity(),
                po.getUnitPrice(),
                itemDiscount,
                gstRate,
                isInterstate
        );

        InvoiceItem item = new InvoiceItem();
        item.setItemNumber(1);
        item.setProductName(po.getProductName() != null ? po.getProductName() : "Chemical Product");
        item.setProductCode(po.getMasterProductCode());
        item.setHsnCode(hsnCode);
        item.setQuantity(po.getQuantity());
        item.setUnit(po.getUnit() != null ? po.getUnit() : "MT");
        item.setUnitPrice(po.getUnitPrice());
        item.setDiscountAmount(itemDiscount);
        item.setTaxableValue(taxCalc.getTaxableValue());
        item.setGstRate(gstRate);
        item.setCgstRate(taxCalc.getCgstRate());
        item.setCgstAmount(taxCalc.getCgstAmount());
        item.setSgstRate(taxCalc.getSgstRate());
        item.setSgstAmount(taxCalc.getSgstAmount());
        item.setIgstRate(taxCalc.getIgstRate());
        item.setIgstAmount(taxCalc.getIgstAmount());
        item.setTotalAmount(taxCalc.getTotalAmount());

        invoice.addItem(item);

        // Monetary Totals
        invoice.setTaxableAmount(taxCalc.getTaxableValue());
        invoice.setDiscountAmount(itemDiscount);
        invoice.setAdditionalCharges(additionalCharges);
        invoice.setCgstAmount(taxCalc.getCgstAmount());
        invoice.setSgstAmount(taxCalc.getSgstAmount());
        invoice.setIgstAmount(taxCalc.getIgstAmount());
        invoice.setTotalTaxAmount(taxCalc.getTotalItemTax());

        BigDecimal grandTotal = taxCalc.getTaxableValue()
                .add(taxCalc.getTotalItemTax())
                .add(additionalCharges)
                .setScale(4, RoundingMode.HALF_UP);

        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountDue(grandTotal);

        invoice.setNotes(request.getNotes());
        invoice.setTermsAndConditions(request.getTermsAndConditions() != null ? request.getTermsAndConditions() : po.getPaymentTerms());
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setIssuedBy(supplierLegalName);

        // Audit Trail
        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "ISSUED",
                "Tax Invoice issued for Purchase Order " + po.getPoNumber() + " with grand total INR " + grandTotal
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);

        if (notificationService != null && po.getBuyerId() != null) {
            try {
                Notification n = notificationService.createNotification(
                        po.getBuyerId(),
                        po.getSupplierId() != null ? UUID.nameUUIDFromBytes(("supplier:" + po.getSupplierId()).getBytes()) : null,
                        NotificationType.INVOICE_ISSUED,
                        NotificationCategory.INVOICE,
                        NotificationPriority.NORMAL,
                        "Tax Invoice Issued: " + saved.getInvoiceNumber(),
                        String.format("Supplier %s has issued Tax Invoice %s for Purchase Order %s (Total: INR %s).",
                                supplierLegalName, saved.getInvoiceNumber(), po.getPoNumber(), saved.getGrandTotal()),
                        NotificationEntityType.INVOICE,
                        saved.getId()
                );
                if (n != null && emailNotificationService != null) {
                    emailNotificationService.sendNotificationEmail(n);
                }
            } catch (Exception e) {
                // Non-blocking notification dispatch failure
            }
        }

        return mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto cancelInvoice(UUID supplierUserId, UUID invoiceId, String reason) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Invoice is already cancelled.");
        }
        if (invoice.getStatus() == InvoiceStatus.PAID) {
            throw new IllegalStateException("Cannot cancel a fully paid invoice.");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "CANCELLED",
                "Invoice cancelled by supplier. Reason: " + (reason != null ? reason : "No reason specified")
        );
        invoice.addAudit(audit);
        Invoice saved = invoiceRepository.save(invoice);

        if (notificationService != null && saved.getBuyerId() != null) {
            try {
                Notification n = notificationService.createNotification(
                        saved.getBuyerId(),
                        saved.getSupplierId() != null ? UUID.nameUUIDFromBytes(("supplier:" + saved.getSupplierId()).getBytes()) : null,
                        NotificationType.INVOICE_CANCELLED,
                        NotificationCategory.INVOICE,
                        NotificationPriority.HIGH,
                        "Invoice Cancelled: " + saved.getInvoiceNumber(),
                        "Tax Invoice " + saved.getInvoiceNumber() + " has been cancelled by the supplier." + (reason != null ? " Reason: " + reason : ""),
                        NotificationEntityType.INVOICE,
                        saved.getId()
                );
                if (n != null && emailNotificationService != null) {
                    emailNotificationService.sendNotificationEmail(n);
                }
            } catch (Exception e) {
                // Non-blocking
            }
        }

        return mapToInvoiceDto(saved);
    }

    // ==========================================
    // 3. Retrieval & Filtering (Strict IDOR Protected)
    // ==========================================

    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceForBuyer(UUID buyerId, UUID invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
        return mapToInvoiceDto(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceForSupplier(UUID supplierUserId, UUID invoiceId) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
        return mapToInvoiceDto(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceDto getInvoiceForAdmin(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));
        return mapToInvoiceDto(invoice);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDto> listInvoicesForBuyer(UUID buyerId, InvoiceStatus status, Pageable pageable) {
        Page<Invoice> page;
        if (status != null) {
            page = invoiceRepository.findByBuyerIdAndStatus(buyerId, status, pageable);
        } else {
            page = invoiceRepository.findByBuyerId(buyerId, pageable);
        }
        return page.map(InvoiceService::mapToInvoiceDto);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDto> listInvoicesForSupplier(UUID supplierUserId, InvoiceStatus status, Pageable pageable) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Page<Invoice> page;
        if (status != null) {
            page = invoiceRepository.findBySupplierIdAndStatus(supplier.getId(), status, pageable);
        } else {
            page = invoiceRepository.findBySupplierId(supplier.getId(), pageable);
        }
        return page.map(InvoiceService::mapToInvoiceDto);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceDto> listInvoicesForAdmin(InvoiceStatus status, Pageable pageable) {
        Page<Invoice> page;
        if (status != null) {
            page = invoiceRepository.findByStatus(status, pageable);
        } else {
            page = invoiceRepository.findAll(pageable);
        }
        return page.map(InvoiceService::mapToInvoiceDto);
    }

    // ==========================================
    // 4. Non-Custodial Payment Tracking & Verification
    // ==========================================

    @Transactional
    public InvoiceDto recordPayment(UUID buyerId, UUID invoiceId, RecordPaymentRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot record payment for a cancelled invoice.");
        }

        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setRecordedById(buyerId);
        record.setPaymentReference(request.getPaymentReference().trim());
        record.setPaymentMode(request.getPaymentMode());
        record.setPaymentDate(request.getPaymentDate());
        record.setAmountPaid(request.getAmountPaid().setScale(4, RoundingMode.HALF_UP));
        record.setBankName(request.getBankName() != null ? request.getBankName().trim() : null);
        record.setProofDocumentId(request.getProofDocumentId());
        record.setStatus(PaymentStatus.PROOF_UPLOADED);

        invoice.addPaymentRecord(record);

        // Update overall payment status if pending
        if (invoice.getPaymentStatus() == PaymentStatus.PENDING) {
            invoice.setPaymentStatus(PaymentStatus.PROOF_UPLOADED);
        }

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                buyerId,
                "PAYMENT_RECORDED",
                String.format("Buyer recorded payment proof of INR %s via %s (Ref: %s)",
                        request.getAmountPaid(), request.getPaymentMode(), request.getPaymentReference())
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToInvoiceDto(saved);
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

        record.setStatus(PaymentStatus.CONFIRMED);
        record.setReviewedById(supplierUserId);
        record.setReviewedAt(LocalDateTime.now());
        record.setReviewNotes(request != null ? request.getReviewNotes() : null);

        // Recalculate confirmed amount paid
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

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "PAYMENT_CONFIRMED",
                String.format("Supplier confirmed receipt of payment INR %s (Ref: %s). New balance due: INR %s",
                        record.getAmountPaid(), record.getPaymentReference(), due)
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto disputePayment(UUID supplierUserId, UUID invoiceId, UUID paymentRecordId, DisputePaymentRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        InvoicePaymentRecord record = invoice.getPaymentRecords().stream()
                .filter(r -> r.getId().equals(paymentRecordId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found: " + paymentRecordId));

        record.setStatus(PaymentStatus.DISPUTED);
        record.setDisputeReason(request.getDisputeReason());
        record.setReviewedById(supplierUserId);
        record.setReviewedAt(LocalDateTime.now());

        invoice.setPaymentStatus(PaymentStatus.DISPUTED);

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "PAYMENT_DISPUTED",
                "Supplier disputed payment reference " + record.getPaymentReference() + ". Reason: " + request.getDisputeReason()
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToInvoiceDto(saved);
    }

    // ==========================================
    // 5. Cancellation & Dispute Controls
    // ==========================================

    @Transactional
    public InvoiceDto cancelInvoice(UUID supplierUserId, UUID invoiceId, CancelInvoiceRequest request) {
        User supplierUser = userRepository.findById(supplierUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier user not found"));
        Supplier supplier = supplierIdentityResolver.resolveOperationalSupplier(supplierUser);

        Invoice invoice = invoiceRepository.findByIdAndSupplierId(invoiceId, supplier.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        boolean hasConfirmedPayments = invoice.getPaymentRecords().stream()
                .anyMatch(r -> r.getStatus() == PaymentStatus.CONFIRMED);
        if (hasConfirmedPayments) {
            throw new IllegalStateException("Cannot cancel an invoice with confirmed payments. Settle or reverse payments first.");
        }

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.setCancellationReason(request.getCancellationReason());
        invoice.setCancelledAt(LocalDateTime.now());
        invoice.setCancelledBy(supplier.getLegalName() != null ? supplier.getLegalName() : supplierUser.getName());

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                supplierUserId,
                "CANCELLED",
                "Invoice cancelled by supplier. Reason: " + request.getCancellationReason()
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToInvoiceDto(saved);
    }

    @Transactional
    public InvoiceDto disputeInvoice(UUID buyerId, UUID invoiceId, DisputeInvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == InvoiceStatus.CANCELLED) {
            throw new IllegalStateException("Cannot dispute a cancelled invoice.");
        }

        invoice.setStatus(InvoiceStatus.DISPUTED);
        invoice.setDisputeReason(request.getDisputeReason());

        InvoiceAudit audit = new InvoiceAudit(
                invoice,
                buyerId,
                "DISPUTED",
                "Invoice disputed by buyer. Reason: " + request.getDisputeReason()
        );
        invoice.addAudit(audit);

        Invoice saved = invoiceRepository.save(invoice);
        return mapToInvoiceDto(saved);
    }

    // ==========================================
    // 6. PDF Rendering
    // ==========================================

    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(UUID invoiceId, UUID requestingUserId, boolean isAdmin) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (!isAdmin) {
            boolean isBuyer = invoice.getBuyerId().equals(requestingUserId);
            boolean isSupplier = (invoice.getSupplierUserId() != null && invoice.getSupplierUserId().equals(requestingUserId));
            if (!isBuyer && !isSupplier) {
                // Check if user is associated supplier
                User user = userRepository.findById(requestingUserId).orElse(null);
                if (user != null) {
                    Optional<Supplier> supplierOpt = supplierIdentityResolver.resolveOperationalSupplierOptional(user);
                    if (supplierOpt.isEmpty() || !supplierOpt.get().getId().equals(invoice.getSupplierId())) {
                        throw new ResourceNotFoundException("Invoice not found: " + invoiceId);
                    }
                } else {
                    throw new ResourceNotFoundException("Invoice not found: " + invoiceId);
                }
            }
        }

        return invoicePdfGenerator.generateInvoicePdf(invoice);
    }

    // ==========================================
    // Mapping Helpers
    // ==========================================

    private BusinessTaxProfileDto mapToTaxProfileDto(BusinessTaxProfile profile) {
        BusinessTaxProfileDto dto = new BusinessTaxProfileDto();
        dto.setId(profile.getId());
        dto.setUserId(profile.getUserId());
        dto.setLegalBusinessName(profile.getLegalBusinessName());
        dto.setTradeName(profile.getTradeName());
        dto.setGstin(profile.getGstin());
        dto.setIsGstRegistered(profile.getIsGstRegistered());
        dto.setGstRegistrationType(profile.getGstRegistrationType());
        dto.setPanNumber(profile.getPanNumber());
        dto.setRegisteredAddress(profile.getRegisteredAddress());
        dto.setCity(profile.getCity());
        dto.setState(profile.getState());
        dto.setStateCode(profile.getStateCode());
        dto.setPostalCode(profile.getPostalCode());
        dto.setCountry(profile.getCountry());
        dto.setCreatedAt(profile.getCreatedAt());
        dto.setUpdatedAt(profile.getUpdatedAt());
        return dto;
    }

    public static InvoiceDto mapToInvoiceDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setFinancialYear(invoice.getFinancialYear());
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setStatus(invoice.getStatus());
        dto.setPaymentStatus(invoice.getPaymentStatus());

        dto.setPurchaseOrderId(invoice.getPurchaseOrderId());
        dto.setPoNumber(invoice.getPoNumber());
        dto.setRfqId(invoice.getRfqId());
        dto.setRfqReference(invoice.getRfqReference());
        dto.setQuotationId(invoice.getQuotationId());
        dto.setQuotationReference(invoice.getQuotationReference());

        dto.setSupplierId(invoice.getSupplierId());
        dto.setSupplierUserId(invoice.getSupplierUserId());
        dto.setSupplierLegalName(invoice.getSupplierLegalName());
        dto.setSupplierTradeName(invoice.getSupplierTradeName());
        dto.setSupplierGstin(invoice.getSupplierGstin());
        dto.setSupplierPan(invoice.getSupplierPan());
        dto.setSupplierAddress(invoice.getSupplierAddress());
        dto.setSupplierCity(invoice.getSupplierCity());
        dto.setSupplierState(invoice.getSupplierState());
        dto.setSupplierStateCode(invoice.getSupplierStateCode());
        dto.setSupplierPostalCode(invoice.getSupplierPostalCode());
        dto.setSupplierEmail(invoice.getSupplierEmail());
        dto.setSupplierPhone(invoice.getSupplierPhone());

        dto.setBuyerId(invoice.getBuyerId());
        dto.setBuyerLegalName(invoice.getBuyerLegalName());
        dto.setBuyerTradeName(invoice.getBuyerTradeName());
        dto.setBuyerGstin(invoice.getBuyerGstin());
        dto.setBuyerPan(invoice.getBuyerPan());
        dto.setBuyerBillingAddress(invoice.getBuyerBillingAddress());
        dto.setBuyerShippingAddress(invoice.getBuyerShippingAddress());
        dto.setBuyerCity(invoice.getBuyerCity());
        dto.setBuyerState(invoice.getBuyerState());
        dto.setBuyerStateCode(invoice.getBuyerStateCode());
        dto.setBuyerPostalCode(invoice.getBuyerPostalCode());
        dto.setBuyerEmail(invoice.getBuyerEmail());
        dto.setBuyerPhone(invoice.getBuyerPhone());

        dto.setIsInterstate(invoice.getIsInterstate());
        dto.setPlaceOfSupplyState(invoice.getPlaceOfSupplyState());
        dto.setPlaceOfSupplyStateCode(invoice.getPlaceOfSupplyStateCode());
        dto.setCurrency(invoice.getCurrency());

        dto.setTaxableAmount(invoice.getTaxableAmount());
        dto.setDiscountAmount(invoice.getDiscountAmount());
        dto.setAdditionalCharges(invoice.getAdditionalCharges());
        dto.setCgstAmount(invoice.getCgstAmount());
        dto.setSgstAmount(invoice.getSgstAmount());
        dto.setIgstAmount(invoice.getIgstAmount());
        dto.setTotalTaxAmount(invoice.getTotalTaxAmount());
        dto.setGrandTotal(invoice.getGrandTotal());
        dto.setAmountPaid(invoice.getAmountPaid());
        dto.setAmountDue(invoice.getAmountDue());

        dto.setVersion(invoice.getVersion());
        dto.setOriginalInvoiceId(invoice.getOriginalInvoiceId());
        dto.setRevisedInvoiceId(invoice.getRevisedInvoiceId());
        dto.setCancellationReason(invoice.getCancellationReason());
        dto.setDisputeReason(invoice.getDisputeReason());
        dto.setNotes(invoice.getNotes());
        dto.setTermsAndConditions(invoice.getTermsAndConditions());
        dto.setIssuedAt(invoice.getIssuedAt());
        dto.setIssuedBy(invoice.getIssuedBy());
        dto.setCancelledAt(invoice.getCancelledAt());
        dto.setCancelledBy(invoice.getCancelledBy());
        dto.setCreatedAt(invoice.getCreatedAt());
        dto.setUpdatedAt(invoice.getUpdatedAt());

        if (invoice.getItems() != null) {
            dto.setItems(invoice.getItems().stream().map(item -> {
                InvoiceItemDto itemDto = new InvoiceItemDto();
                itemDto.setId(item.getId());
                itemDto.setItemNumber(item.getItemNumber());
                itemDto.setProductName(item.getProductName());
                itemDto.setProductCode(item.getProductCode());
                itemDto.setCasNumber(item.getCasNumber());
                itemDto.setHsnCode(item.getHsnCode());
                itemDto.setQuantity(item.getQuantity());
                itemDto.setUnit(item.getUnit());
                itemDto.setUnitPrice(item.getUnitPrice());
                itemDto.setDiscountAmount(item.getDiscountAmount());
                itemDto.setTaxableValue(item.getTaxableValue());
                itemDto.setGstRate(item.getGstRate());
                itemDto.setCgstRate(item.getCgstRate());
                itemDto.setCgstAmount(item.getCgstAmount());
                itemDto.setSgstRate(item.getSgstRate());
                itemDto.setSgstAmount(item.getSgstAmount());
                itemDto.setIgstRate(item.getIgstRate());
                itemDto.setIgstAmount(item.getIgstAmount());
                itemDto.setTotalAmount(item.getTotalAmount());
                itemDto.setCreatedAt(item.getCreatedAt());
                return itemDto;
            }).collect(Collectors.toList()));
        }

        if (invoice.getPaymentRecords() != null) {
            dto.setPaymentRecords(invoice.getPaymentRecords().stream().map(record -> {
                InvoicePaymentRecordDto prDto = new InvoicePaymentRecordDto();
                prDto.setId(record.getId());
                prDto.setInvoiceId(invoice.getId());
                prDto.setPurchaseOrderId(record.getPurchaseOrderId());
                prDto.setBuyerId(record.getBuyerId());
                prDto.setSupplierId(record.getSupplierId());
                prDto.setRecordedById(record.getRecordedById());
                prDto.setPaymentReference(record.getPaymentReference());
                prDto.setPaymentMode(record.getPaymentMode());
                prDto.setPaymentDate(record.getPaymentDate());
                prDto.setAmountPaid(record.getAmountPaid());
                prDto.setCurrency(record.getCurrency());
                prDto.setNotes(record.getNotes());
                prDto.setBankName(record.getBankName());
                prDto.setProofDocumentId(record.getProofDocumentId());
                prDto.setProofFileName(record.getProofFileName());
                prDto.setProofFileSize(record.getProofFileSize());
                prDto.setProofContentType(record.getProofContentType());
                prDto.setStatus(record.getStatus());
                prDto.setReviewedById(record.getReviewedById());
                prDto.setReviewedAt(record.getReviewedAt());
                prDto.setConfirmedById(record.getConfirmedById());
                prDto.setConfirmedAt(record.getConfirmedAt());
                prDto.setReviewNotes(record.getReviewNotes());
                prDto.setRejectionReason(record.getRejectionReason());
                prDto.setInfoRequestedNotes(record.getInfoRequestedNotes());
                prDto.setDisputeReason(record.getDisputeReason());
                prDto.setCreatedAt(record.getCreatedAt());
                prDto.setUpdatedAt(record.getUpdatedAt());
                return prDto;
            }).collect(Collectors.toList()));
        }

        if (invoice.getAudits() != null) {
            dto.setAudits(invoice.getAudits().stream().map(a -> {
                InvoiceAuditDto aDto = new InvoiceAuditDto();
                aDto.setId(a.getId());
                aDto.setInvoiceId(invoice.getId());
                aDto.setActorId(a.getActorId());
                aDto.setAction(a.getAction());
                aDto.setDetails(a.getDetails());
                aDto.setCreatedAt(a.getCreatedAt());
                return aDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }
}
