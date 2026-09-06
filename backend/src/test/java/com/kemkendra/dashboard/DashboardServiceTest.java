package com.kemkendra.dashboard;

import com.kemkendra.dashboard.dto.BuyerDashboardSummaryResponse;
import com.kemkendra.dashboard.dto.SupplierDashboardSummaryResponse;
import com.kemkendra.dispute.Dispute;
import com.kemkendra.dispute.DisputeReason;
import com.kemkendra.dispute.DisputeRepository;
import com.kemkendra.dispute.DisputeStatus;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.invoice.Invoice;
import com.kemkendra.invoice.InvoiceRepository;
import com.kemkendra.invoice.InvoiceStatus;
import com.kemkendra.invoice.PaymentStatus;
import com.kemkendra.order.OrderStatus;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.rfq.Rfq;
import com.kemkendra.rfq.RfqRepository;
import com.kemkendra.rfq.RfqStatus;
import com.kemkendra.seller.SupplierVerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private DisputeRepository disputeRepository;

    private User buyerUser;
    private User supplierUser;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        buyerUser = new User(UUID.randomUUID(), "Buyer Org", "buyer-" + UUID.randomUUID() + "@example.com", "+919876543210", "pass", UserRole.USER, UserStatus.ACTIVE);
        buyerUser = userRepository.save(buyerUser);

        supplierUser = new User(UUID.randomUUID(), "Supplier Org", "supp-" + UUID.randomUUID() + "@example.com", "+919876543211", "pass", UserRole.SUPPLIER, UserStatus.ACTIVE);
        supplierUser = userRepository.save(supplierUser);

        supplier = new Supplier();
        supplier.setName("Apex Global Chemicals");
        supplier.setSlug("apex-global-" + UUID.randomUUID());
        supplier.setUser(supplierUser);
        supplier.setCountryName("India");
        supplier.setVerified(true);
        supplier.setVerificationStatus(SupplierVerificationStatus.VERIFIED);
        supplier.setLegalName("Apex Global Chemicals Pvt Ltd");
        supplier.setRegisteredAddress("123 Chemical Hub, Vadodara, Gujarat");
        supplier = supplierRepository.save(supplier);
    }

    @Test
    @DisplayName("Buyer dashboard computes correct RFQ, Order, and Financial metrics")
    void testBuyerDashboardMetrics() {
        // 1. Create RFQs
        Rfq rfq1 = new Rfq();
        rfq1.setId(UUID.randomUUID());
        rfq1.setBuyerId(buyerUser.getId());
        rfq1.setSupplierId(supplier.getId());
        rfq1.setQuantity(new BigDecimal("100"));
        rfq1.setUnit("kg");
        rfq1.setStatus(RfqStatus.QUOTED);
        rfq1.setCreatedAt(LocalDateTime.now());
        rfq1.setUpdatedAt(LocalDateTime.now());
        rfqRepository.save(rfq1);

        Rfq rfq2 = new Rfq();
        rfq2.setId(UUID.randomUUID());
        rfq2.setBuyerId(buyerUser.getId());
        rfq2.setSupplierId(supplier.getId());
        rfq2.setQuantity(new BigDecimal("500"));
        rfq2.setUnit("kg");
        rfq2.setStatus(RfqStatus.ACCEPTED);
        rfq2.setCreatedAt(LocalDateTime.now());
        rfq2.setUpdatedAt(LocalDateTime.now());
        rfqRepository.save(rfq2);

        // 2. Create Order
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + UUID.randomUUID().toString().substring(0, 8));
        po.setRfqId(rfq2.getId());
        po.setQuotationId(UUID.randomUUID());
        po.setBuyerId(buyerUser.getId());
        po.setSupplierId(supplier.getId());
        po.setQuantity(new BigDecimal("500"));
        po.setUnit("kg");
        po.setUnitPrice(new BigDecimal("25.00"));
        po.setTotalAmount(new BigDecimal("12500.00"));
        po.setCurrency("INR");
        po.setShippingAddress("123 Port Road, Mumbai, Maharashtra");
        po.setBillingContact("Buyer Org (Accounts)");
        po.setPlacedAt(LocalDateTime.now());
        po.setStatus(OrderStatus.CONFIRMED);
        purchaseOrderRepository.save(po);

        // 3. Create Invoice
        Invoice inv = new Invoice();
        inv.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8));
        inv.setFinancialYear("2026-2027");
        inv.setInvoiceDate(LocalDate.now());
        inv.setDueDate(LocalDate.now().plusDays(30));
        inv.setStatus(InvoiceStatus.ISSUED);
        inv.setPaymentStatus(PaymentStatus.PENDING);
        inv.setBuyerId(buyerUser.getId());
        inv.setSupplierId(supplier.getId());
        inv.setBuyerLegalName("Buyer Org");
        inv.setBuyerBillingAddress("Mumbai, India");
        inv.setBuyerShippingAddress("Mumbai, India");
        inv.setBuyerState("Maharashtra");
        inv.setBuyerStateCode("27");
        inv.setPlaceOfSupplyState("Maharashtra");
        inv.setPlaceOfSupplyStateCode("27");
        inv.setIsInterstate(true);
        inv.setSupplierLegalName("Apex Global");
        inv.setSupplierAddress("Vadodara, India");
        inv.setSupplierState("Gujarat");
        inv.setSupplierStateCode("24");
        inv.setGrandTotal(new BigDecimal("14750.00"));
        inv.setAmountDue(new BigDecimal("14750.00"));
        inv.setTaxableAmount(new BigDecimal("12500.00"));
        inv.setTotalTaxAmount(new BigDecimal("2250.00"));
        invoiceRepository.save(inv);

        // Fetch Buyer Dashboard
        BuyerDashboardSummaryResponse response = dashboardService.getBuyerDashboard(buyerUser);

        assertThat(response).isNotNull();
        assertThat(response.totalRfqs()).isEqualTo(2);
        assertThat(response.activeRfqs()).isEqualTo(2);
        assertThat(response.pendingQuotations()).isEqualTo(1);
        assertThat(response.acceptedQuotations()).isEqualTo(1);
        assertThat(response.totalOrders()).isEqualTo(1);
        assertThat(response.pendingOrders()).isEqualTo(1);
        assertThat(response.outstandingInvoiceAmount()).isEqualByComparingTo(new BigDecimal("14750.00"));
        assertThat(response.paidInvoiceAmount()).isEqualByComparingTo(BigDecimal.ZERO);

        // Pending Actions should highlight quote to review and unpaid invoice
        assertThat(response.pendingActions()).anyMatch(a -> a.actionType().equals("QUOTATION"));
        assertThat(response.pendingActions()).anyMatch(a -> a.actionType().equals("INVOICE"));
    }

    @Test
    @DisplayName("Supplier dashboard computes correct incoming inquiry, order pipeline, and payment metrics")
    void testSupplierDashboardMetrics() {
        // 1. Create RFQ for supplier
        Rfq rfq = new Rfq();
        rfq.setId(UUID.randomUUID());
        rfq.setBuyerId(buyerUser.getId());
        rfq.setSupplierId(supplier.getId());
        rfq.setQuantity(new BigDecimal("2000"));
        rfq.setUnit("L");
        rfq.setStatus(RfqStatus.PENDING);
        rfq.setCreatedAt(LocalDateTime.now());
        rfq.setUpdatedAt(LocalDateTime.now());
        rfqRepository.save(rfq);

        // 2. Create Order
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-" + UUID.randomUUID().toString().substring(0, 8));
        po.setRfqId(rfq.getId());
        po.setQuotationId(UUID.randomUUID());
        po.setBuyerId(buyerUser.getId());
        po.setSupplierId(supplier.getId());
        po.setQuantity(new BigDecimal("2000"));
        po.setUnit("L");
        po.setUnitPrice(new BigDecimal("5.00"));
        po.setTotalAmount(new BigDecimal("10000.00"));
        po.setCurrency("INR");
        po.setShippingAddress("456 Industrial Belt, Pune, Maharashtra");
        po.setBillingContact("Procurement Team");
        po.setPlacedAt(LocalDateTime.now());
        po.setStatus(OrderStatus.PLACED);
        purchaseOrderRepository.save(po);

        // 3. Create Dispute
        Dispute dispute = new Dispute();
        dispute.setDisputeNumber("DISP-" + UUID.randomUUID().toString().substring(0, 8));
        dispute.setPurchaseOrderId(po.getId());
        dispute.setBuyerId(buyerUser.getId());
        dispute.setSupplierId(supplier.getId());
        dispute.setRaisedById(buyerUser.getId());
        dispute.setRaisedByRole("BUYER");
        dispute.setReason(DisputeReason.ORDER_DELIVERY_ISSUE);
        dispute.setDescription("Purity below standard specification");
        dispute.setStatus(DisputeStatus.OPEN);
        disputeRepository.save(dispute);

        // Fetch Supplier Dashboard
        SupplierDashboardSummaryResponse response = dashboardService.getSupplierDashboard(supplierUser);

        assertThat(response).isNotNull();
        assertThat(response.supplierId()).isEqualTo(supplier.getId());
        assertThat(response.isVerified()).isTrue();
        assertThat(response.rfqsReceived()).isEqualTo(1);
        assertThat(response.pendingRfqs()).isEqualTo(1);
        assertThat(response.totalOrders()).isEqualTo(1);
        assertThat(response.pendingOrders()).isEqualTo(1);
        assertThat(response.openDisputes()).isEqualTo(1);

        // Pending Actions should prompt responding to RFQ, confirming order, and resolving dispute
        assertThat(response.pendingActions()).anyMatch(a -> a.actionType().equals("RFQ"));
        assertThat(response.pendingActions()).anyMatch(a -> a.actionType().equals("ORDER"));
        assertThat(response.pendingActions()).anyMatch(a -> a.actionType().equals("DISPUTE"));
    }

    @Test
    @DisplayName("Dashboard data strictly isolates buyer and supplier records")
    void testDashboardDataIsolation() {
        // Create another buyer
        User otherBuyer = new User(UUID.randomUUID(), "Other Buyer", "other-" + UUID.randomUUID() + "@example.com", "+919876543299", "pass", UserRole.USER, UserStatus.ACTIVE);
        otherBuyer = userRepository.save(otherBuyer);

        // Buyer 1 has RFQ
        Rfq rfq = new Rfq();
        rfq.setId(UUID.randomUUID());
        rfq.setBuyerId(buyerUser.getId());
        rfq.setSupplierId(supplier.getId());
        rfq.setQuantity(new BigDecimal("100"));
        rfq.setUnit("kg");
        rfq.setStatus(RfqStatus.PENDING);
        rfq.setCreatedAt(LocalDateTime.now());
        rfq.setUpdatedAt(LocalDateTime.now());
        rfqRepository.save(rfq);

        // Other buyer should have 0 RFQs and 0 orders
        BuyerDashboardSummaryResponse otherDashboard = dashboardService.getBuyerDashboard(otherBuyer);
        assertThat(otherDashboard.totalRfqs()).isEqualTo(0);
        assertThat(otherDashboard.totalOrders()).isEqualTo(0);
        assertThat(otherDashboard.outstandingInvoiceAmount()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
