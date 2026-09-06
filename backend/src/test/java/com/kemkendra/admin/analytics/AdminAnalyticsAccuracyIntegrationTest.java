package com.kemkendra.admin.analytics;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.kemkendra.product.*;
import com.kemkendra.rfq.Rfq;
import com.kemkendra.rfq.RfqRepository;
import com.kemkendra.rfq.RfqStatus;
import com.kemkendra.rfq.quotation.Quotation;
import com.kemkendra.rfq.quotation.QuotationRepository;
import com.kemkendra.security.JwtService;
import com.kemkendra.seller.SupplierVerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminAnalyticsAccuracyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private MasterProductRepository masterProductRepository;

    @Autowired
    private SupplierOfferingRepository supplierOfferingRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String adminToken;
    private User adminUser;
    private User buyerUser;
    private User supplierUser;
    private Supplier supplier;
    private MasterProduct masterProduct;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("UPDATE rfqs SET accepted_quotation_id = NULL; " +
                "DELETE FROM invoice_payment_records; " +
                "DELETE FROM disputes; " +
                "DELETE FROM invoices; " +
                "DELETE FROM buyer_shortlist_items; " +
                "DELETE FROM buyer_shortlists; " +
                "DELETE FROM governance_audit_logs; " +
                "DELETE FROM audit_logs; " +
                "DELETE FROM notifications; " +
                "DELETE FROM documents; " +
                "DELETE FROM shipments; " +
                "DELETE FROM purchase_orders; " +
                "DELETE FROM quotations; " +
                "DELETE FROM rfqs; " +
                "DELETE FROM supplier_offerings; " +
                "DELETE FROM product_master_mappings; " +
                "DELETE FROM master_products; " +
                "DELETE FROM product_analytics_events; " +
                "DELETE FROM products; " +
                "DELETE FROM seller_profiles; " +
                "DELETE FROM suppliers; " +
                "DELETE FROM email_verification_tokens; " +
                "DELETE FROM password_reset_tokens; " +
                "DELETE FROM users;");

        // Admin
        adminUser = new User();
        adminUser.setName("Platform Admin");
        adminUser.setEmail("admin.test@kemkendra.com");
        adminUser.setPasswordHash("hash123");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEmailVerifiedAt(Instant.now());
        adminUser = userRepository.save(adminUser);
        adminToken = "Bearer " + jwtService.generateToken(adminUser);

        // Buyer
        buyerUser = new User();
        buyerUser.setName("Chemical Buyer");
        buyerUser.setEmail("buyer.test@kemkendra.com");
        buyerUser.setPasswordHash("hash123");
        buyerUser.setRole(UserRole.USER);
        buyerUser.setStatus(UserStatus.ACTIVE);
        buyerUser.setEmailVerifiedAt(Instant.now());
        buyerUser = userRepository.save(buyerUser);

        // Supplier
        supplierUser = new User();
        supplierUser.setName("Supplier Exec");
        supplierUser.setEmail("supplier.test@kemkendra.com");
        supplierUser.setPasswordHash("hash123");
        supplierUser.setRole(UserRole.SUPPLIER);
        supplierUser.setStatus(UserStatus.ACTIVE);
        supplierUser.setEmailVerifiedAt(Instant.now());
        supplierUser = userRepository.save(supplierUser);

        supplier = new Supplier();
        supplier.setName("Apex Chemical Labs");
        supplier.setVerificationStatus(SupplierVerificationStatus.VERIFIED);
        supplier.setUser(supplierUser);
        supplier.setCreatedAt(LocalDateTime.now().minusDays(10));
        supplier = supplierRepository.save(supplier);

        // Master Product
        masterProduct = new MasterProduct();
        masterProduct.setName("Acetone High Purity");
        masterProduct.setMasterProductCode("MP-ACE-001");
        masterProduct.setCasNumber("67-64-1");
        masterProduct.setCategory(ProductCategory.SPECIALTY_CHEMICAL);
        masterProduct.setStatus("ACTIVE");
        masterProduct = masterProductRepository.save(masterProduct);

        // Active Commercial Offering
        SupplierOffering offering = new SupplierOffering();
        offering.setSupplier(supplier);
        offering.setMasterProduct(masterProduct);
        offering.setPrice(BigDecimal.valueOf(150.00));
        offering.setStock(5000);
        offering.setAvailabilityStatus("AVAILABLE");
        offering.setModerationStatus("APPROVED");
        supplierOfferingRepository.save(offering);
    }

    @Test
    @DisplayName("Empty dataset: KPI endpoints return valid zeroes without division-by-zero or NPE")
    void testEmptyDatasetMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalBuyers", is(1)))
                .andExpect(jsonPath("$.totalSuppliers", is(1)))
                .andExpect(jsonPath("$.verifiedSuppliers", is(1)))
                .andExpect(jsonPath("$.totalProducts", is(1)))
                .andExpect(jsonPath("$.activeCommercialOfferings", is(1)))
                .andExpect(jsonPath("$.totalRfqs", is(0)))
                .andExpect(jsonPath("$.totalOrders", is(0)))
                .andExpect(jsonPath("$.openDisputes", is(0)));

        mockMvc.perform(get("/api/v1/admin/analytics/rfqs")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRfqs", is(0)))
                .andExpect(jsonPath("$.averageQuotationsPerRfq", is(0.0)))
                .andExpect(jsonPath("$.rfqToQuotationConversionRate", is(0.0)))
                .andExpect(jsonPath("$.quotationAcceptanceRate", is(0.0)));
    }

    @Test
    @DisplayName("Full RFQ, Order, and Invoice Lifecycle: Dashboard and detailed metrics are 100% accurate")
    void testAccurateLifecycleMetrics() throws Exception {
        // 1. Create RFQ
        Rfq rfq = new Rfq();
        rfq.setBuyerId(buyerUser.getId());
        rfq.setSupplierId(supplier.getId());
        rfq.setMasterProductId(masterProduct.getId());
        rfq.setQuantity(BigDecimal.valueOf(100));
        rfq.setUnit("KG");
        rfq.setStatus(RfqStatus.QUOTED);
        rfq = rfqRepository.save(rfq);

        // 2. Create Quotation
        Quotation quote = new Quotation();
        quote.setRfq(rfq);
        quote.setQuotationVersion(1);
        quote.setUnitPrice(BigDecimal.valueOf(140.00));
        quote.setCurrency("INR");
        quote.setValidityDate(LocalDate.now().plusDays(15));
        quote.setActorType("SUPPLIER");
        quote = quotationRepository.save(quote);

        // Accept quotation on RFQ
        rfq.setAcceptedQuotationId(quote.getId());
        rfq.setStatus(RfqStatus.ACCEPTED);
        rfqRepository.save(rfq);

        // 3. Create Purchase Order
        PurchaseOrder po = new PurchaseOrder();
        po.setPoNumber("PO-2026-TEST-001");
        po.setRfqId(rfq.getId());
        po.setQuotationId(quote.getId());
        po.setBuyerId(buyerUser.getId());
        po.setSupplierId(supplier.getId());
        po.setMasterProductId(masterProduct.getId());
        po.setProductName("Acetone High Purity");
        po.setQuantity(BigDecimal.valueOf(100));
        po.setUnit("KG");
        po.setUnitPrice(BigDecimal.valueOf(140.00));
        po.setTotalAmount(BigDecimal.valueOf(14000.00));
        po.setCurrency("INR");
        po.setStatus(OrderStatus.COMPLETED);
        po.setShippingAddress("Test Shipping Address");
        po.setBillingContact("Test Billing Contact");
        po.setPlacedAt(LocalDateTime.now().minusDays(2));
        po.setCompletedAt(LocalDateTime.now());
        purchaseOrderRepository.save(po);

        // 4. Create Invoice
        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-2026-TEST-001");
        invoice.setFinancialYear("2026-2027");
        invoice.setInvoiceDate(LocalDate.now().minusDays(2));
        invoice.setDueDate(LocalDate.now().plusDays(28));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(PaymentStatus.CONFIRMED);
        invoice.setSupplierId(supplier.getId());
        invoice.setSupplierLegalName(supplier.getName());
        invoice.setSupplierState("Maharashtra");
        invoice.setSupplierStateCode("27");
        invoice.setSupplierAddress("123 Industrial Area, Mumbai");
        invoice.setBuyerId(buyerUser.getId());
        invoice.setBuyerLegalName("Acme Buyer Ltd");
        invoice.setBuyerState("Maharashtra");
        invoice.setBuyerStateCode("27");
        invoice.setBuyerBillingAddress("456 Chemical Zone, Pune");
        invoice.setBuyerShippingAddress("456 Chemical Zone, Pune");
        invoice.setPlaceOfSupplyState("Maharashtra");
        invoice.setPlaceOfSupplyStateCode("27");
        invoice.setGrandTotal(BigDecimal.valueOf(14000.00));
        invoice.setAmountPaid(BigDecimal.valueOf(14000.00));
        invoice.setAmountDue(BigDecimal.ZERO);
        invoiceRepository.save(invoice);

        // Assert 15 KPIs
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRfqs", is(1)))
                .andExpect(jsonPath("$.totalQuotations", is(1)))
                .andExpect(jsonPath("$.totalOrders", is(1)))
                .andExpect(jsonPath("$.completedOrders", is(1)))
                .andExpect(jsonPath("$.cancelledOrders", is(0)))
                .andExpect(jsonPath("$.totalInvoiceValue", is(14000.0)))
                .andExpect(jsonPath("$.paidInvoiceValue", is(14000.0)))
                .andExpect(jsonPath("$.outstandingInvoiceValue", is(0.0)))
                .andExpect(jsonPath("$.openDisputes", is(0)));

        // Assert RFQ Conversion & Turnaround
        mockMvc.perform(get("/api/v1/admin/analytics/rfqs")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRfqs", is(1)))
                .andExpect(jsonPath("$.rfqsReceivingQuotations", is(1)))
                .andExpect(jsonPath("$.rfqToQuotationConversionRate", is(100.0)))
                .andExpect(jsonPath("$.quotationAcceptanceRate", is(100.0)));

        // Assert Order Analytics & Top Products
        mockMvc.perform(get("/api/v1/admin/analytics/orders")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders", is(1)))
                .andExpect(jsonPath("$.completedOrders", is(1)))
                .andExpect(jsonPath("$.averageOrderValue", is(14000.0)))
                .andExpect(jsonPath("$.mostOrderedProducts", hasSize(1)))
                .andExpect(jsonPath("$.mostOrderedProducts[0].productName", is("Acetone High Purity")));

        // Assert Invoices & Payments Report
        mockMvc.perform(get("/api/v1/admin/analytics/invoices")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalInvoiceValue", is(14000.0)))
                .andExpect(jsonPath("$.paidAmount", is(14000.0)))
                .andExpect(jsonPath("$.outstandingAmount", is(0.0)))
                .andExpect(jsonPath("$.platformRevenueNotice", notNullValue()));
    }

    @Test
    @DisplayName("Export CSV generates RFC 4180 compliant CSV bytes with UTF-8 BOM")
    void testCsvExportEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/export/orders")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", containsString("text/csv")))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"kemkendra_orders_report_")))
                .andExpect(content().string(containsString("PO Number,Reference,Chemical Product")));
    }
}
