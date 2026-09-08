package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.invoice.dto.*;
import com.kemkendra.order.OrderStatus;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.seller.SupplierIdentityResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceLifecycleSecurityTest {

    @Mock private BusinessTaxProfileRepository taxProfileRepository;
    @Mock private InvoiceRepository invoiceRepository;
    @Mock private InvoiceItemRepository itemRepository;
    @Mock private InvoicePaymentRecordRepository paymentRecordRepository;
    @Mock private InvoiceAuditRepository auditRepository;
    @Mock private PurchaseOrderRepository purchaseOrderRepository;
    @Mock private UserRepository userRepository;
    @Mock private SupplierRepository supplierRepository;
    @Mock private com.kemkendra.seller.SellerProfileRepository sellerProfileRepository;
    @Mock private InvoiceSequenceRepository sequenceRepository;

    private SupplierIdentityResolver supplierIdentityResolver;
    private InvoiceNumberService invoiceNumberService;
    private InvoicePdfGenerator invoicePdfGenerator;
    private GstCalculationService gstCalculationService;
    private InvoiceService invoiceService;

    private UUID buyerId;
    private User buyerUser;
    private UUID supplierUserId;
    private User supplierUser;
    private Long supplierId;
    private Supplier supplier;
    private PurchaseOrder purchaseOrder;

    @BeforeEach
    void setUp() {
        gstCalculationService = new GstCalculationService();
        supplierIdentityResolver = new SupplierIdentityResolver(supplierRepository, sellerProfileRepository);
        invoiceNumberService = new InvoiceNumberService(sequenceRepository);
        invoicePdfGenerator = new InvoicePdfGenerator();
        invoiceService = new InvoiceService(
                taxProfileRepository,
                invoiceRepository,
                itemRepository,
                paymentRecordRepository,
                auditRepository,
                purchaseOrderRepository,
                userRepository,
                supplierRepository,
                supplierIdentityResolver,
                gstCalculationService,
                invoiceNumberService,
                invoicePdfGenerator
        );

        buyerId = UUID.randomUUID();
        buyerUser = new User();
        buyerUser.setId(buyerId);
        buyerUser.setName("Buyer Industries");
        buyerUser.setEmail("buyer@buyerchem.com");
        buyerUser.setRole(UserRole.USER);
        buyerUser.setStatus(UserStatus.ACTIVE);

        supplierUserId = UUID.randomUUID();
        supplierUser = new User();
        supplierUser.setId(supplierUserId);
        supplierUser.setName("Apex Supplier");
        supplierUser.setEmail("sales@apexchem.com");
        supplierUser.setRole(UserRole.SUPPLIER);
        supplierUser.setStatus(UserStatus.ACTIVE);

        supplierId = 100L;
        supplier = new Supplier();
        ReflectionTestUtils.setField(supplier, "id", supplierId);
        supplier.setName("Apex Chemical Industries");
        supplier.setLegalName("Apex Chemical Industries Pvt Ltd");
        supplier.setTaxVatNumber("27AAAAA0000A1Z5");
        supplier.setStateProvince("Maharashtra");
        supplier.setCity("Mumbai");
        supplier.setRegisteredAddress("Andheri East");

        purchaseOrder = new PurchaseOrder();
        purchaseOrder.setId(UUID.randomUUID());
        purchaseOrder.setPoNumber("PO-2026-001");
        purchaseOrder.setBuyerId(buyerId);
        purchaseOrder.setSupplierId(supplierId);
        purchaseOrder.setStatus(OrderStatus.CONFIRMED);
        purchaseOrder.setQuantity(new BigDecimal("10.00"));
        purchaseOrder.setUnit("MT");
        purchaseOrder.setUnitPrice(new BigDecimal("50000.0000"));
        purchaseOrder.setTotalAmount(new BigDecimal("500000.0000"));
        purchaseOrder.setProductName("Acetone CP Grade");
        purchaseOrder.setMasterProductCode("ACE-01");
        purchaseOrder.setShippingAddress("Survey 42, Vapi, Gujarat");
        purchaseOrder.setBillingContact("Accounts Payable, accounts@buyerchem.com");
    }

    @Test
    @DisplayName("Should successfully issue invoice from confirmed PO with calculated GST and snapshot")
    void testIssueInvoiceSuccess() {
        IssueInvoiceRequest request = new IssueInvoiceRequest();
        request.setPurchaseOrderId(purchaseOrder.getId());
        request.setGstRate(new BigDecimal("18.00"));
        request.setHsnCode("2914");

        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(purchaseOrderRepository.findById(purchaseOrder.getId())).thenReturn(Optional.of(purchaseOrder));
        when(invoiceRepository.findByPurchaseOrderId(purchaseOrder.getId())).thenReturn(new ArrayList<>());
        when(sequenceRepository.findByFinancialYearForUpdate(any())).thenReturn(Optional.of(new InvoiceSequence("2026-27", 1L)));
        when(sequenceRepository.saveAndFlush(any(InvoiceSequence.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyerUser));

        // Supplier has no tax profile, falls back to Supplier entity
        when(taxProfileRepository.findByUserId(supplierUserId)).thenReturn(Optional.empty());

        // Setup buyer tax profile in Gujarat (State Code 24)
        BusinessTaxProfile buyerTax = new BusinessTaxProfile();
        buyerTax.setLegalBusinessName("Buyer Industries Ltd");
        buyerTax.setGstin("24ABCDE1234F1Z5");
        buyerTax.setState("Gujarat");
        buyerTax.setStateCode("24");
        buyerTax.setRegisteredAddress("Vapi Industrial Area");
        when(taxProfileRepository.findByUserId(buyerId)).thenReturn(Optional.of(buyerTax));

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(UUID.randomUUID());
            return inv;
        });

        InvoiceDto result = invoiceService.issueInvoiceFromOrder(supplierUserId, request);

        assertThat(result).isNotNull();
        assertThat(result.getInvoiceNumber()).isEqualTo("KK/2026-27/00001");
        assertThat(result.getStatus()).isEqualTo(InvoiceStatus.ISSUED);
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
        // Inter-state (MH 27 to GJ 24)
        assertThat(result.getIsInterstate()).isTrue();
        assertThat(result.getPlaceOfSupplyStateCode()).isEqualTo("24");
        assertThat(result.getTaxableAmount()).isEqualByComparingTo("500000.0000");
        assertThat(result.getIgstAmount()).isEqualByComparingTo("90000.0000");
        assertThat(result.getCgstAmount()).isEqualByComparingTo("0.0000");
        assertThat(result.getGrandTotal()).isEqualByComparingTo("590000.0000");
        assertThat(result.getAmountDue()).isEqualByComparingTo("590000.0000");
        assertThat(result.getAudits()).isNotEmpty();
    }

    @Test
    @DisplayName("Should block invoice issuance if an active invoice already exists for the PO")
    void testPreventDuplicateInvoiceIssuance() {
        IssueInvoiceRequest request = new IssueInvoiceRequest();
        request.setPurchaseOrderId(purchaseOrder.getId());

        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(purchaseOrderRepository.findById(purchaseOrder.getId())).thenReturn(Optional.of(purchaseOrder));

        Invoice existingInvoice = new Invoice();
        existingInvoice.setInvoiceNumber("KK/2026-27/00001");
        existingInvoice.setStatus(InvoiceStatus.ISSUED);
        when(invoiceRepository.findByPurchaseOrderId(purchaseOrder.getId())).thenReturn(List.of(existingInvoice));

        assertThatThrownBy(() -> invoiceService.issueInvoiceFromOrder(supplierUserId, request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should protect buyer invoice access against IDOR (unauthorized buyer receives 404)")
    void testBuyerIdorProtection() {
        UUID invoiceId = UUID.randomUUID();
        UUID otherBuyerId = UUID.randomUUID();

        when(invoiceRepository.findByIdAndBuyerId(invoiceId, otherBuyerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.getInvoiceForBuyer(otherBuyerId, invoiceId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should protect supplier invoice access against IDOR (unauthorized supplier receives 404)")
    void testSupplierIdorProtection() {
        UUID invoiceId = UUID.randomUUID();
        UUID otherSupplierUserId = UUID.randomUUID();
        User otherSupplierUser = new User();
        otherSupplierUser.setId(otherSupplierUserId);
        Supplier otherSupplier = new Supplier();
        ReflectionTestUtils.setField(otherSupplier, "id", 999L);

        when(userRepository.findById(otherSupplierUserId)).thenReturn(Optional.of(otherSupplierUser));
        when(supplierRepository.findByUser(otherSupplierUser)).thenReturn(Optional.of(otherSupplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, otherSupplier.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.getInvoiceForSupplier(otherSupplierUserId, invoiceId))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Should record buyer payment proof and update payment status")
    void testRecordPaymentProof() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setBuyerId(buyerId);
        invoice.setGrandTotal(new BigDecimal("100000.0000"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("100000.0000"));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(PaymentStatus.PENDING);

        when(invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setPaymentReference("UTR12345678");
        request.setPaymentMode(PaymentMode.NEFT);
        request.setPaymentDate(LocalDate.now());
        request.setAmountPaid(new BigDecimal("100000.0000"));
        request.setBankName("HDFC Bank");

        InvoiceDto updated = invoiceService.recordPayment(buyerId, invoiceId, request);

        assertThat(updated.getPaymentStatus()).isEqualTo(PaymentStatus.PROOF_UPLOADED);
        assertThat(updated.getPaymentRecords()).hasSize(1);
        assertThat(updated.getPaymentRecords().get(0).getPaymentReference()).isEqualTo("UTR12345678");
    }

    @Test
    @DisplayName("Should allow supplier to confirm payment and transition invoice to PAID")
    void testConfirmPaymentTransitionsToPaid() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setSupplierId(supplierId);
        invoice.setGrandTotal(new BigDecimal("100000.0000"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("100000.0000"));
        invoice.setStatus(InvoiceStatus.ISSUED);

        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setAmountPaid(new BigDecimal("100000.0000"));
        record.setStatus(PaymentStatus.PROOF_UPLOADED);
        invoice.addPaymentRecord(record);

        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(i -> i.getArgument(0));

        InvoiceDto updated = invoiceService.confirmPayment(supplierUserId, invoiceId, recordId, new ConfirmPaymentRequest("Received in HDFC account"));

        assertThat(updated.getStatus()).isEqualTo(InvoiceStatus.PAID);
        assertThat(updated.getPaymentStatus()).isEqualTo(PaymentStatus.CONFIRMED);
        assertThat(updated.getAmountPaid()).isEqualByComparingTo("100000.0000");
        assertThat(updated.getAmountDue()).isEqualByComparingTo("0.0000");
    }

    @Test
    @DisplayName("Should reject invoice cancellation if confirmed payments exist")
    void testBlockCancellationWithConfirmedPayments() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setSupplierId(supplierId);

        InvoicePaymentRecord confirmedRecord = new InvoicePaymentRecord();
        confirmedRecord.setId(UUID.randomUUID());
        confirmedRecord.setStatus(PaymentStatus.CONFIRMED);
        invoice.addPaymentRecord(confirmedRecord);

        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));

        assertThatThrownBy(() -> invoiceService.cancelInvoice(supplierUserId, invoiceId, new CancelInvoiceRequest("Wrong invoice")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("confirmed payments");
    }
}
