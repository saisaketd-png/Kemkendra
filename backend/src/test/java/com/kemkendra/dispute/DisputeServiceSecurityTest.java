package com.kemkendra.dispute;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.dispute.dto.*;
import com.kemkendra.document.FileSecurityValidator;
import com.kemkendra.document.storage.StorageService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.invoice.Invoice;
import com.kemkendra.invoice.InvoiceRepository;
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

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DisputeServiceSecurityTest {

    @Mock
    private DisputeRepository disputeRepository;

    @Mock
    private DisputeAttachmentRepository attachmentRepository;

    @Mock
    private DisputeTimelineEventRepository timelineEventRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

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
    private DisputeService disputeService;

    private UUID buyerId;
    private UUID supplierUserId;
    private Long supplierId;
    private UUID invoiceId;
    private Invoice invoice;
    private User supplierUser;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        fileSecurityValidator = new FileSecurityValidator();
        supplierIdentityResolver = new SupplierIdentityResolver(supplierRepository, sellerProfileRepository);

        disputeService = new DisputeService(
                disputeRepository,
                attachmentRepository,
                timelineEventRepository,
                invoiceRepository,
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

        supplierUser = new User();
        supplierUser.setId(supplierUserId);
        supplierUser.setEmail("supplier@chemicalcorp.com");
        supplierUser.setRole(UserRole.SUPPLIER);

        supplier = new Supplier();
        supplier.setId(supplierId);
        supplier.setUser(supplierUser);

        invoice = new Invoice();
        invoice.setId(invoiceId);
        invoice.setInvoiceNumber("KK/2026-27/00001");
        invoice.setBuyerId(buyerId);
        invoice.setSupplierId(supplierId);
        invoice.setSupplierUserId(supplierUserId);
        invoice.setGrandTotal(new BigDecimal("100000.0000"));
    }

    @Test
    void testBuyerCanCreateDisputeWithSequentialNumbering() {
        when(invoiceRepository.findByIdAndBuyerId(invoiceId, buyerId)).thenReturn(Optional.of(invoice));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateDisputeRequest request = new CreateDisputeRequest();
        request.setInvoiceId(invoiceId);
        request.setReason(DisputeReason.PAYMENT_NOT_RECEIVED);
        request.setDescription("Payment was remitted 48 hours ago but supplier reports not received.");

        DisputeDto result = disputeService.createDispute(buyerId, request, null);

        assertNotNull(result);
        assertNotNull(result.getDisputeNumber());
        assertTrue(result.getDisputeNumber().startsWith("DSP-"));
        assertEquals(DisputeStatus.OPEN, result.getStatus());
        assertEquals(DisputeReason.PAYMENT_NOT_RECEIVED, result.getReason());
        assertEquals(buyerId, result.getBuyerId());
        assertEquals(supplierId, result.getSupplierId());
        assertEquals("BUYER", result.getRaisedByRole());
        assertEquals(1, result.getTimelineEvents().size());
        assertEquals("CREATED", result.getTimelineEvents().get(0).getAction());
    }

    @Test
    void testDisputeIdorSecurityEnforcement() {
        UUID disputeId = UUID.randomUUID();
        UUID otherBuyerId = UUID.randomUUID();

        when(disputeRepository.findByIdAndBuyerId(disputeId, otherBuyerId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                disputeService.getDisputeForBuyer(otherBuyerId, disputeId));
    }

    @Test
    void testSupplierCanRespondToDispute() {
        UUID disputeId = UUID.randomUUID();
        Dispute dispute = new Dispute();
        dispute.setId(disputeId);
        dispute.setDisputeNumber("DSP-20260906-1234");
        dispute.setBuyerId(buyerId);
        dispute.setSupplierId(supplierId);
        dispute.setStatus(DisputeStatus.WAITING_FOR_INFORMATION);

        when(disputeRepository.findById(disputeId)).thenReturn(Optional.of(dispute));
        when(userRepository.findById(supplierUserId)).thenReturn(Optional.of(supplierUser));
        when(supplierRepository.findByUser(supplierUser)).thenReturn(Optional.of(supplier));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RespondDisputeRequest request = new RespondDisputeRequest("We have checked our ICICI bank statement and the funds reflect now.");
        DisputeDto result = disputeService.respondToDispute(supplierUserId, disputeId, request, null);

        assertNotNull(result);
        // Should transition from WAITING_FOR_INFORMATION to UNDER_REVIEW
        assertEquals(DisputeStatus.UNDER_REVIEW, result.getStatus());
        assertTrue(result.getTimelineEvents().stream().anyMatch(e -> e.getAction().equals("MESSAGE_POSTED")));
    }

    @Test
    void testAdminDisputeAssignmentAndResolution() {
        UUID disputeId = UUID.randomUUID();
        UUID adminId = UUID.randomUUID();
        UUID assignedAdminId = UUID.randomUUID();

        User adminUser = new User();
        adminUser.setId(adminId);
        adminUser.setEmail("admin@kemkendra.com");
        adminUser.setRole(UserRole.ADMIN);

        User assignedAdmin = new User();
        assignedAdmin.setId(assignedAdminId);
        assignedAdmin.setEmail("lead-disputes@kemkendra.com");
        assignedAdmin.setRole(UserRole.ADMIN);

        Dispute dispute = new Dispute();
        dispute.setId(disputeId);
        dispute.setDisputeNumber("DSP-20260906-5678");
        dispute.setBuyerId(buyerId);
        dispute.setSupplierId(supplierId);
        dispute.setStatus(DisputeStatus.OPEN);

        when(disputeRepository.findById(disputeId)).thenReturn(Optional.of(dispute));
        when(userRepository.findById(assignedAdminId)).thenReturn(Optional.of(assignedAdmin));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // 1. Assign Admin
        AssignDisputeRequest assignReq = new AssignDisputeRequest(assignedAdminId);
        DisputeDto assignedDto = disputeService.assignDispute(adminId, disputeId, assignReq);
        assertEquals(assignedAdminId, assignedDto.getAssignedAdminId());
        assertEquals(DisputeStatus.UNDER_REVIEW, assignedDto.getStatus());

        // 2. Resolve Dispute
        ResolveDisputeRequest resolveReq = new ResolveDisputeRequest("Payment settled and bank receipt verified by operations.");
        DisputeDto resolvedDto = disputeService.resolveDispute(adminId, disputeId, resolveReq);
        assertEquals(DisputeStatus.RESOLVED, resolvedDto.getStatus());
        assertEquals("Payment settled and bank receipt verified by operations.", resolvedDto.getResolutionNotes());
        assertEquals(adminId, resolvedDto.getResolvedById());
        assertNotNull(resolvedDto.getResolvedAt());
    }
}
