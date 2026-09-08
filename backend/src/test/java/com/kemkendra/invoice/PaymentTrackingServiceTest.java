package com.kemkendra.invoice;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.document.FileSecurityValidator;
import com.kemkendra.document.storage.StorageService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.invoice.dto.ConfirmPaymentRequest;
import com.kemkendra.invoice.dto.InvoiceDto;
import com.kemkendra.invoice.dto.RecordPaymentRequest;
import com.kemkendra.invoice.dto.RejectPaymentRequest;
import com.kemkendra.invoice.dto.RequestPaymentInfoRequest;
import com.kemkendra.notification.NotificationService;
import com.kemkendra.order.PurchaseOrder;
import com.kemkendra.order.PurchaseOrderRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.seller.SellerProfileRepository;
import com.kemkendra.seller.SupplierIdentityResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentTrackingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoicePaymentRecordRepository paymentRecordRepository;

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private SellerProfileRepository sellerProfileRepository;

    private FileSecurityValidator fileSecurityValidator;

    @Mock
    private StorageService storageService;

    @Mock
    private NotificationService notificationService;

    private SupplierIdentityResolver supplierIdentityResolver;
    private PaymentTrackingService paymentTrackingService;

    private UUID buyerId;
    private UUID supplierUserId;
    private Long supplierId;
    private UUID invoiceId;
    private UUID poId;
    private Invoice invoice;
    private PurchaseOrder purchaseOrder;
    private User supplierUser;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        fileSecurityValidator = new FileSecurityValidator();
        supplierIdentityResolver = new SupplierIdentityResolver(supplierRepository, sellerProfileRepository);

        paymentTrackingService = new PaymentTrackingService(
                invoiceRepository,
                paymentRecordRepository,
                purchaseOrderRepository,
                userRepository,
                supplierIdentityResolver,
                fileSecurityValidator,
                storageService,
                notificationService
        );

        buyerId = UUID.randomUUID();
        supplierUserId = UUID.randomUUID();
        supplierId = 42L;
        invoiceId = UUID.randomUUID();
        poId = UUID.randomUUID();

        supplierUser = new User();
        supplierUser.setId(supplierUserId);
        supplierUser.setRole(UserRole.SUPPLIER);

        supplier = new Supplier();
        supplier.setId(supplierId);
        supplier.setUser(supplierUser);

        purchaseOrder = new PurchaseOrder();
        purchaseOrder.setId(poId);
        purchaseOrder.setPoNumber("PO-2026-001");
        purchaseOrder.setBuyerId(buyerId);
        purchaseOrder.setSupplierId(supplierId);
        purchaseOrder.setTotalAmount(new BigDecimal("100000.0000"));
        purchaseOrder.setCurrency("INR");

        invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setInvoiceNumber("KK/2026-27/00001");
        invoice.setBuyerId(buyerId);
        invoice.setSupplierId(supplierId);
        invoice.setSupplierUserId(supplierUserId);
        invoice.setPurchaseOrderId(poId);
        invoice.setGrandTotal(new BigDecimal("118000.0000"));
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountDue(new BigDecimal("118000.0000"));
        invoice.setStatus(InvoiceStatus.ISSUED);
        invoice.setPaymentStatus(PaymentStatus.PENDING);
    }

    @Test
    void testPartialPaymentRecording() {
        when(invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setPaymentReference("UTR12345678");
        request.setPaymentMode(PaymentMode.NEFT);
        request.setPaymentDate(LocalDate.now());
        request.setAmountPaid(new BigDecimal("50000.0000"));

        InvoiceDto result = paymentTrackingService.recordPayment(buyerId, invoiceId, request, null);
        assertNotNull(result);

        assertEquals(1, invoice.getPaymentRecords().size());
        InvoicePaymentRecord record = invoice.getPaymentRecords().get(0);
        assertEquals(new BigDecimal("50000.0000"), record.getAmountPaid());
        assertEquals("UTR12345678", record.getPaymentReference());
        assertEquals(PaymentStatus.PROOF_UPLOADED, record.getStatus());
        assertEquals(PaymentStatus.PROOF_UPLOADED, invoice.getPaymentStatus());
    }

    @Test
    void testOverpaymentRejection() {
        when(invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)).thenReturn(Optional.of(invoice));

        RecordPaymentRequest request = new RecordPaymentRequest();
        request.setPaymentReference("UTR12345678");
        request.setPaymentMode(PaymentMode.NEFT);
        request.setPaymentDate(LocalDate.now());
        request.setAmountPaid(new BigDecimal("150000.0000")); // Exceeds 118,000

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                paymentTrackingService.recordPayment(buyerId, invoiceId, request, null));
        assertTrue(ex.getMessage().contains("exceeds remaining balance due"));
    }

    @Test
    void testFullPaymentConfirmationSynchronizesOrderAndInvoice() {
        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));
        when(purchaseOrderRepository.findById(poId)).thenReturn(Optional.of(purchaseOrder));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setAmountPaid(new BigDecimal("118000.0000"));
        record.setPaymentReference("UTR9999");
        record.setStatus(PaymentStatus.PROOF_UPLOADED);
        invoice.addPaymentRecord(record);

        ConfirmPaymentRequest confirmReq = new ConfirmPaymentRequest("Full payment verified in HDFC account");
        InvoiceDto dto = paymentTrackingService.confirmPayment(supplierUserId, invoiceId, recordId, confirmReq);

        assertNotNull(dto);
        assertEquals(PaymentStatus.CONFIRMED, record.getStatus());
        assertEquals(new BigDecimal("118000.0000"), invoice.getAmountPaid());
        assertEquals(BigDecimal.ZERO.setScale(4), invoice.getAmountDue());
        assertEquals(InvoiceStatus.PAID, invoice.getStatus());
        assertEquals(PaymentStatus.CONFIRMED, invoice.getPaymentStatus());

        // Verify purchase order was updated
        assertEquals("CONFIRMED", purchaseOrder.getPaymentStatus());
        assertNotNull(purchaseOrder.getPaymentSettledAt());
        verify(purchaseOrderRepository).save(purchaseOrder);
    }

    @Test
    void testDuplicatePaymentConfirmationPrevention() {
        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));

        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setAmountPaid(new BigDecimal("50000.0000"));
        record.setStatus(PaymentStatus.CONFIRMED); // Already confirmed!
        invoice.addPaymentRecord(record);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                paymentTrackingService.confirmPayment(supplierUserId, invoiceId, recordId, new ConfirmPaymentRequest()));
        assertTrue(ex.getMessage().contains("already confirmed"));
    }

    @Test
    void testSupplierPaymentRejection() {
        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setAmountPaid(new BigDecimal("20000.0000"));
        record.setPaymentReference("UTR_INVALID");
        record.setStatus(PaymentStatus.PROOF_UPLOADED);
        invoice.addPaymentRecord(record);

        RejectPaymentRequest rejectReq = new RejectPaymentRequest("UTR not reflected in statement");
        paymentTrackingService.rejectPayment(supplierUserId, invoiceId, recordId, rejectReq);

        assertEquals(PaymentStatus.FAILED, record.getStatus());
        assertEquals("UTR not reflected in statement", record.getRejectionReason());
    }

    @Test
    void testSupplierRequestPaymentInfo() {
        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(invoiceRepository.findByIdAndSupplierId(invoiceId, supplierId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setAmountPaid(new BigDecimal("20000.0000"));
        record.setPaymentReference("UTR_BLURRY");
        record.setStatus(PaymentStatus.PROOF_UPLOADED);
        invoice.addPaymentRecord(record);

        RequestPaymentInfoRequest infoReq = new RequestPaymentInfoRequest("Please upload a legible counterfoil receipt");
        paymentTrackingService.requestPaymentInfo(supplierUserId, invoiceId, recordId, infoReq);

        assertEquals("Please upload a legible counterfoil receipt", record.getInfoRequestedNotes());
    }

    @Test
    void testLoadPaymentProofIdorSecurity() {
        UUID recordId = UUID.randomUUID();
        InvoicePaymentRecord record = new InvoicePaymentRecord();
        record.setId(recordId);
        record.setBuyerId(buyerId);
        record.setSupplierId(supplierId);
        record.setProofStorageKey("proofs/test-proof.pdf");
        record.setProofFileName("test-proof.pdf");
        record.setProofContentType("application/pdf");

        when(paymentRecordRepository.findById(recordId)).thenReturn(Optional.of(record));
        when(storageService.loadAsResource("proofs/test-proof.pdf")).thenReturn(new ByteArrayResource(new byte[]{1, 2, 3}));

        User buyerUser = new User();
        buyerUser.setId(buyerId);
        buyerUser.setRole(UserRole.USER);

        // 1. Authorized Buyer should succeed
        PaymentTrackingService.PaymentProofDownload download = paymentTrackingService.loadPaymentProof(recordId, buyerUser);
        assertNotNull(download);
        assertEquals("test-proof.pdf", download.fileName());

        // 2. Unauthorized third-party user must be blocked with 404
        User thirdParty = new User();
        thirdParty.setId(UUID.randomUUID());
        thirdParty.setRole(UserRole.USER);

        assertThrows(ResourceNotFoundException.class, () ->
                paymentTrackingService.loadPaymentProof(recordId, thirdParty));
    }
}
