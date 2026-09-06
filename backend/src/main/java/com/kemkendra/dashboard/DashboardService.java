package com.kemkendra.dashboard;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dashboard.dto.*;
import com.kemkendra.dispute.Dispute;
import com.kemkendra.dispute.DisputeRepository;
import com.kemkendra.dispute.DisputeStatus;
import com.kemkendra.identity.User;
import com.kemkendra.invoice.*;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationRepository;
import com.kemkendra.notification.dto.NotificationResponse;
import com.kemkendra.order.OrderStatus;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierOfferingRepository;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.rfq.Rfq;
import com.kemkendra.rfq.RfqRepository;
import com.kemkendra.rfq.RfqStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final RfqRepository rfqRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final InvoiceRepository invoiceRepository;
    private final DisputeRepository disputeRepository;
    private final SupplierOfferingRepository supplierOfferingRepository;
    private final SupplierRepository supplierRepository;
    private final BusinessTaxProfileRepository businessTaxProfileRepository;
    private final NotificationRepository notificationRepository;

    public DashboardService(
            RfqRepository rfqRepository,
            PurchaseOrderRepository purchaseOrderRepository,
            InvoiceRepository invoiceRepository,
            DisputeRepository disputeRepository,
            SupplierOfferingRepository supplierOfferingRepository,
            SupplierRepository supplierRepository,
            BusinessTaxProfileRepository businessTaxProfileRepository,
            NotificationRepository notificationRepository
    ) {
        this.rfqRepository = rfqRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.invoiceRepository = invoiceRepository;
        this.disputeRepository = disputeRepository;
        this.supplierOfferingRepository = supplierOfferingRepository;
        this.supplierRepository = supplierRepository;
        this.businessTaxProfileRepository = businessTaxProfileRepository;
        this.notificationRepository = notificationRepository;
    }

    public BuyerDashboardSummaryResponse getBuyerDashboard(User user) {
        UUID userId = user.getId();

        // 1. Tax profile
        Optional<BusinessTaxProfile> taxProfileOpt = businessTaxProfileRepository.findByUserId(userId);
        boolean isTaxProfileComplete = taxProfileOpt.map(p -> p.getGstin() != null && p.getRegisteredAddress() != null).orElse(false);
        String companyName = taxProfileOpt.map(BusinessTaxProfile::getLegalBusinessName).orElse(null);

        // 2. RFQ Aggregations
        long totalRfqs = rfqRepository.countByBuyerId(userId);
        long activeRfqs = rfqRepository.countByBuyerIdAndStatusNotIn(userId,
                List.of(RfqStatus.CLOSED, RfqStatus.CANCELLED, RfqStatus.REJECTED, RfqStatus.EXPIRED));
        long pendingQuotations = rfqRepository.countByBuyerIdAndStatus(userId, RfqStatus.QUOTED);
        long acceptedQuotations = rfqRepository.countByBuyerIdAndStatus(userId, RfqStatus.ACCEPTED);
        long quotationsReceived = pendingQuotations + acceptedQuotations;

        // 3. Order Aggregations
        long totalOrders = purchaseOrderRepository.countByBuyerId(userId);
        long pendingOrders = purchaseOrderRepository.countByBuyerIdAndStatusIn(userId,
                List.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED));
        long completedOrders = purchaseOrderRepository.countByBuyerIdAndStatus(userId, OrderStatus.DELIVERED)
                + purchaseOrderRepository.countByBuyerIdAndStatus(userId, OrderStatus.COMPLETED);

        // 4. Financials
        BigDecimal outstandingInvoiceAmount = invoiceRepository.sumOutstandingAmountByBuyerId(userId);
        BigDecimal paidInvoiceAmount = invoiceRepository.sumPaidAmountByBuyerId(userId);

        // 5. Disputes
        long openDisputes = disputeRepository.countByBuyerIdAndStatusIn(userId,
                List.of(DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.WAITING_FOR_INFORMATION));

        // 6. Notifications
        List<NotificationResponse> recentNotifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5))
                .getContent()
                .stream()
                .map(NotificationResponse::from)
                .toList();

        // 7. Pending Actions for Buyer
        List<PendingActionDto> pendingActions = new ArrayList<>();
        if (!isTaxProfileComplete) {
            pendingActions.add(new PendingActionDto(
                    "tax_profile_incomplete",
                    "PROFILE",
                    "Complete Business Tax Profile",
                    "Provide your business GSTIN and legal billing details for compliant invoicing.",
                    1,
                    "MEDIUM",
                    "/dashboard/settings",
                    "Update Profile"
            ));
        }

        if (pendingQuotations > 0) {
            pendingActions.add(new PendingActionDto(
                    "quotations_to_review",
                    "QUOTATION",
                    "Commercial Quotations Awaiting Review",
                    pendingQuotations + " supplier quotation(s) are ready for evaluation or order confirmation.",
                    (int) pendingQuotations,
                    "HIGH",
                    "/dashboard/rfqs?filter=QUOTED",
                    "Review Quotes"
            ));
        }

        long unpaidInvoices = invoiceRepository.countByBuyerIdAndPaymentStatus(userId, PaymentStatus.PENDING);
        if (unpaidInvoices > 0) {
            pendingActions.add(new PendingActionDto(
                    "invoices_awaiting_payment",
                    "INVOICE",
                    "Invoices Awaiting Payment",
                    unpaidInvoices + " issued invoice(s) have pending payments. Upload wire receipt or reference.",
                    (int) unpaidInvoices,
                    "HIGH",
                    "/dashboard/buyer/invoices",
                    "View Invoices"
            ));
        }

        if (openDisputes > 0) {
            pendingActions.add(new PendingActionDto(
                    "open_disputes",
                    "DISPUTE",
                    "Active Disputes Requiring Attention",
                    openDisputes + " active transaction dispute(s) under review.",
                    (int) openDisputes,
                    "MEDIUM",
                    "/dashboard/buyer/disputes",
                    "View Disputes"
            ));
        }

        // 8. Recent Activity
        List<DashboardActivityItemDto> recentActivity = buildBuyerActivityTimeline(userId, 6);

        return new BuyerDashboardSummaryResponse(
                userId,
                user.getName(),
                companyName,
                isTaxProfileComplete,
                totalRfqs,
                activeRfqs,
                quotationsReceived,
                pendingQuotations,
                acceptedQuotations,
                totalOrders,
                pendingOrders,
                completedOrders,
                outstandingInvoiceAmount,
                paidInvoiceAmount,
                openDisputes,
                recentNotifications,
                recentActivity,
                pendingActions
        );
    }

    public SupplierDashboardSummaryResponse getSupplierDashboard(User user) {
        Supplier supplier = supplierRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier profile not found for user: " + user.getId()));
        Long supplierId = supplier.getId();

        boolean isVerified = Boolean.TRUE.equals(supplier.getVerified());
        String verificationStatus = supplier.getVerificationStatus() != null ? supplier.getVerificationStatus().name() : "DRAFT";
        boolean isProfileComplete = supplier.getLegalName() != null && supplier.getRegisteredAddress() != null;

        // 1. Offering Aggregations
        long totalOfferings = supplierOfferingRepository.countBySupplierId(supplierId);
        long activeOfferings = supplierOfferingRepository.countBySupplierIdAndAvailabilityStatusAndModerationStatus(supplierId, "AVAILABLE", "APPROVED");
        long pendingReviewOfferings = supplierOfferingRepository.countBySupplierIdAndModerationStatus(supplierId, "PENDING_REVIEW");

        // 2. RFQ Aggregations
        long rfqsReceived = rfqRepository.countBySupplierId(supplierId);
        long pendingRfqs = rfqRepository.countBySupplierIdAndStatusIn(supplierId,
                List.of(RfqStatus.PENDING, RfqStatus.CONTACTED, RfqStatus.COUNTERED));
        long acceptedQuotations = rfqRepository.countBySupplierIdAndStatus(supplierId, RfqStatus.ACCEPTED);
        long quotationsSubmitted = rfqRepository.countBySupplierIdAndStatusIn(supplierId,
                List.of(RfqStatus.QUOTED, RfqStatus.ACCEPTED, RfqStatus.CLOSED));

        // 3. Order Aggregations
        long totalOrders = purchaseOrderRepository.countBySupplierId(supplierId);
        long pendingOrders = purchaseOrderRepository.countBySupplierIdAndStatusIn(supplierId,
                List.of(OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED));

        // 4. Financials
        long outstandingInvoices = invoiceRepository.countBySupplierIdAndPaymentStatus(supplierId, PaymentStatus.PENDING)
                + invoiceRepository.countBySupplierIdAndPaymentStatus(supplierId, PaymentStatus.PROOF_UPLOADED);
        BigDecimal outstandingInvoiceAmount = invoiceRepository.sumOutstandingAmountBySupplierId(supplierId);
        long confirmedPayments = invoiceRepository.countBySupplierIdAndPaymentStatus(supplierId, PaymentStatus.CONFIRMED);
        BigDecimal confirmedPaymentAmount = invoiceRepository.sumPaidAmountBySupplierId(supplierId);

        // 5. Disputes
        long openDisputes = disputeRepository.countBySupplierIdAndStatusIn(supplierId,
                List.of(DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW, DisputeStatus.WAITING_FOR_INFORMATION));

        // 6. Notifications
        List<NotificationResponse> recentNotifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 5))
                .getContent()
                .stream()
                .map(NotificationResponse::from)
                .toList();

        // 7. Pending Actions for Supplier
        List<PendingActionDto> pendingActions = new ArrayList<>();
        if (!isVerified || "DRAFT".equals(verificationStatus) || "INFORMATION_REQUIRED".equals(verificationStatus)) {
            pendingActions.add(new PendingActionDto(
                    "supplier_verification",
                    "VERIFICATION",
                    "Complete Supplier Due Diligence",
                    "Submit company registration and compliance documents to unlock verified badges and priority ranking.",
                    1,
                    "HIGH",
                    "/dashboard/supplier/verification",
                    "Submit Verification"
            ));
        }

        if (pendingRfqs > 0) {
            pendingActions.add(new PendingActionDto(
                    "rfqs_to_quote",
                    "RFQ",
                    "Incoming RFQs Pending Quotation",
                    pendingRfqs + " buyer inquiry/inquiries require your formal commercial quotation or response.",
                    (int) pendingRfqs,
                    "HIGH",
                    "/dashboard/supplier/rfqs",
                    "Respond to RFQs"
            ));
        }

        long placedOrders = purchaseOrderRepository.countBySupplierIdAndStatus(supplierId, OrderStatus.PLACED);
        if (placedOrders > 0) {
            pendingActions.add(new PendingActionDto(
                    "orders_to_confirm",
                    "ORDER",
                    "Purchase Orders Awaiting Confirmation",
                    placedOrders + " purchase order(s) placed by buyers require commercial confirmation.",
                    (int) placedOrders,
                    "HIGH",
                    "/dashboard/supplier/orders",
                    "Confirm Orders"
            ));
        }

        long paymentsToReview = invoiceRepository.countBySupplierIdAndPaymentStatus(supplierId, PaymentStatus.PROOF_UPLOADED);
        if (paymentsToReview > 0) {
            pendingActions.add(new PendingActionDto(
                    "payments_to_review",
                    "PAYMENT",
                    "Payment Proofs Awaiting Verification",
                    paymentsToReview + " buyer payment record(s) uploaded and awaiting supplier confirmation.",
                    (int) paymentsToReview,
                    "HIGH",
                    "/dashboard/supplier/invoices",
                    "Verify Payments"
            ));
        }

        if (openDisputes > 0) {
            pendingActions.add(new PendingActionDto(
                    "supplier_disputes",
                    "DISPUTE",
                    "Disputes Under Resolution",
                    openDisputes + " active dispute(s) raised on your orders or invoices.",
                    (int) openDisputes,
                    "MEDIUM",
                    "/dashboard/supplier/disputes",
                    "View Disputes"
            ));
        }

        if (totalOfferings == 0) {
            pendingActions.add(new PendingActionDto(
                    "no_offerings",
                    "CATALOG",
                    "Add Products to Catalog",
                    "Publish your chemical offerings to receive direct quotation requests from global buyers.",
                    1,
                    "MEDIUM",
                    "/dashboard/supplier/products/new",
                    "Add Offering"
            ));
        }

        // 8. Recent Activity
        List<DashboardActivityItemDto> recentActivity = buildSupplierActivityTimeline(supplierId, user.getId(), 6);

        return new SupplierDashboardSummaryResponse(
                supplierId,
                supplier.getName(),
                verificationStatus,
                isVerified,
                isProfileComplete,
                totalOfferings,
                activeOfferings,
                pendingReviewOfferings,
                rfqsReceived,
                pendingRfqs,
                quotationsSubmitted,
                acceptedQuotations,
                totalOrders,
                pendingOrders,
                outstandingInvoices,
                outstandingInvoiceAmount,
                confirmedPayments,
                confirmedPaymentAmount,
                openDisputes,
                recentNotifications,
                recentActivity,
                pendingActions
        );
    }

    public List<DashboardActivityItemDto> getUnifiedActivity(User user, boolean isSupplier, int limit) {
        if (isSupplier) {
            Supplier supplier = supplierRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            return buildSupplierActivityTimeline(supplier.getId(), user.getId(), limit);
        } else {
            return buildBuyerActivityTimeline(user.getId(), limit);
        }
    }

    private List<DashboardActivityItemDto> buildBuyerActivityTimeline(UUID buyerId, int limit) {
        List<DashboardActivityItemDto> items = new ArrayList<>();

        // 1. Recent RFQs
        List<Rfq> rfqs = rfqRepository.findTop5ByBuyerIdOrderByCreatedAtDesc(buyerId);
        for (Rfq r : rfqs) {
            items.add(new DashboardActivityItemDto(
                    "rfq-" + r.getId(),
                    "RFQ_CREATED",
                    "Sourcing RFQ Created",
                    "Inquiry submitted for " + r.getQuantity() + " " + r.getUnit(),
                    "RFQ",
                    r.getId().toString(),
                    r.getSourcingRequestReference() != null ? r.getSourcingRequestReference() : "RFQ-" + r.getId().toString().substring(0, 8),
                    r.getStatus().name(),
                    r.getCreatedAt(),
                    "/dashboard/rfqs/" + r.getId()
            ));
        }

        // 2. Recent Orders
        List<PurchaseOrder> orders = purchaseOrderRepository.findTop5ByBuyerIdOrderByCreatedAtDesc(buyerId);
        for (PurchaseOrder po : orders) {
            items.add(new DashboardActivityItemDto(
                    "po-" + po.getId(),
                    "ORDER_CREATED",
                    "Purchase Order Issued",
                    "PO confirmed for " + (po.getProductName() != null ? po.getProductName() : "Chemical supply"),
                    "ORDER",
                    po.getId().toString(),
                    po.getPoNumber(),
                    po.getStatus().name(),
                    po.getCreatedAt(),
                    "/dashboard/orders/" + po.getId()
            ));
        }

        // 3. Recent Invoices
        List<Invoice> invoices = invoiceRepository.findTop5ByBuyerIdOrderByCreatedAtDesc(buyerId);
        for (Invoice inv : invoices) {
            items.add(new DashboardActivityItemDto(
                    "inv-" + inv.getId(),
                    "INVOICE_ISSUED",
                    "Tax Invoice Received",
                    "Invoice for " + (inv.getCurrency() != null ? inv.getCurrency() : "INR") + " " + inv.getGrandTotal(),
                    "INVOICE",
                    inv.getId().toString(),
                    inv.getInvoiceNumber(),
                    inv.getStatus().name(),
                    inv.getCreatedAt(),
                    "/dashboard/buyer/invoices/" + inv.getId()
            ));
        }

        // 4. Recent Disputes
        List<Dispute> disputes = disputeRepository.findTop5ByBuyerIdOrderByCreatedAtDesc(buyerId);
        for (Dispute d : disputes) {
            items.add(new DashboardActivityItemDto(
                    "disp-" + d.getId(),
                    "DISPUTE_RAISED",
                    "Dispute Raised",
                    "Dispute on " + (d.getInvoiceNumber() != null ? d.getInvoiceNumber() : "Order"),
                    "DISPUTE",
                    d.getId().toString(),
                    d.getDisputeNumber(),
                    d.getStatus().name(),
                    d.getCreatedAt(),
                    "/dashboard/buyer/disputes/" + d.getId()
            ));
        }

        // Sort descending by timestamp and limit
        items.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return items.stream().limit(limit).toList();
    }

    private List<DashboardActivityItemDto> buildSupplierActivityTimeline(Long supplierId, UUID userId, int limit) {
        List<DashboardActivityItemDto> items = new ArrayList<>();

        // 1. Recent RFQs received
        List<Rfq> rfqs = rfqRepository.findTop5BySupplierIdOrderByCreatedAtDesc(supplierId);
        for (Rfq r : rfqs) {
            items.add(new DashboardActivityItemDto(
                    "rfq-" + r.getId(),
                    "RFQ_RECEIVED",
                    "Inquiry Received",
                    "Buyer requested quotation for " + r.getQuantity() + " " + r.getUnit(),
                    "RFQ",
                    r.getId().toString(),
                    r.getSourcingRequestReference() != null ? r.getSourcingRequestReference() : "RFQ-" + r.getId().toString().substring(0, 8),
                    r.getStatus().name(),
                    r.getCreatedAt(),
                    "/dashboard/supplier/rfqs/" + r.getId()
            ));
        }

        // 2. Recent Orders received
        List<PurchaseOrder> orders = purchaseOrderRepository.findTop5BySupplierIdOrderByCreatedAtDesc(supplierId);
        for (PurchaseOrder po : orders) {
            items.add(new DashboardActivityItemDto(
                    "po-" + po.getId(),
                    "ORDER_RECEIVED",
                    "Order Received",
                    "Purchase order placed for " + (po.getProductName() != null ? po.getProductName() : "Chemical supply"),
                    "ORDER",
                    po.getId().toString(),
                    po.getPoNumber(),
                    po.getStatus().name(),
                    po.getCreatedAt(),
                    "/dashboard/supplier/orders/" + po.getId()
            ));
        }

        // 3. Recent Invoices
        List<Invoice> invoices = invoiceRepository.findTop5BySupplierIdOrderByCreatedAtDesc(supplierId);
        for (Invoice inv : invoices) {
            items.add(new DashboardActivityItemDto(
                    "inv-" + inv.getId(),
                    "INVOICE_ISSUED",
                    "Commercial Invoice Issued",
                    "Issued invoice " + inv.getInvoiceNumber() + " (" + inv.getPaymentStatus() + ")",
                    "INVOICE",
                    inv.getId().toString(),
                    inv.getInvoiceNumber(),
                    inv.getStatus().name(),
                    inv.getCreatedAt(),
                    "/dashboard/supplier/invoices/" + inv.getId()
            ));
        }

        // 4. Recent Disputes
        List<Dispute> disputes = disputeRepository.findTop5BySupplierIdOrderByCreatedAtDesc(supplierId);
        for (Dispute d : disputes) {
            items.add(new DashboardActivityItemDto(
                    "disp-" + d.getId(),
                    "DISPUTE_RAISED",
                    "Dispute Filed by Buyer",
                    "Dispute raised: " + d.getReason(),
                    "DISPUTE",
                    d.getId().toString(),
                    d.getDisputeNumber(),
                    d.getStatus().name(),
                    d.getCreatedAt(),
                    "/dashboard/supplier/disputes/" + d.getId()
            ));
        }

        // Sort descending by timestamp and limit
        items.sort((a, b) -> b.timestamp().compareTo(a.timestamp()));
        return items.stream().limit(limit).toList();
    }
}
