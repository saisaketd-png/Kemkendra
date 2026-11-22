package com.kemkendra.rfq.sourcing;

import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.rfq.sourcing.dto.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SourcingServiceTest {

    @Mock
    private SourcingRequestRepository sourcingRequestRepository;

    @Mock
    private SourcingAssignmentRepository sourcingAssignmentRepository;

    @Mock
    private SourcingSupplierRepository sourcingSupplierRepository;

    @Mock
    private SourcingOutreachLogRepository sourcingOutreachLogRepository;

    @Mock
    private SourcingQuotationRepository sourcingQuotationRepository;

    @Mock
    private SourcingProposalRepository sourcingProposalRepository;

    @Mock
    private SourcingStatusHistoryRepository sourcingStatusHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private SourcingService sourcingService;

    private User buyer;
    private User admin;
    private UUID buyerId;
    private UUID adminId;

    @BeforeEach
    public void setup() {
        buyerId = UUID.randomUUID();
        buyer = new User();
        buyer.setId(buyerId);
        buyer.setName("Test Buyer");
        buyer.setEmail("buyer@example.com");
        buyer.setRole(UserRole.USER);
        buyer.setStatus(UserStatus.ACTIVE);

        adminId = UUID.randomUUID();
        admin = new User();
        admin.setId(adminId);
        admin.setName("Admin Manager");
        admin.setEmail("admin@kemkendra.com");
        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.ACTIVE);
    }

    @Test
    public void createRequest_success() {
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));

        CreateSourcingRequestDto dto = new CreateSourcingRequestDto(
                "Ascorbic Acid IP",
                "Pharmaceutical Ingredients",
                BigDecimal.valueOf(500),
                "KG",
                "Hyderabad, Telangana",
                "50-81-7",
                "Pharma Grade",
                "99.8% Assay",
                "IP",
                "25 KG Drums",
                BigDecimal.valueOf(650.00),
                "INR",
                LocalDate.now().plusWeeks(2),
                "Need Certificate of Analysis",
                "doc-coa-123"
        );

        when(sourcingRequestRepository.save(any(SourcingRequest.class))).thenAnswer(inv -> {
            SourcingRequest req = inv.getArgument(0);
            req.setId(UUID.randomUUID());
            req.setSourcingRequestReference("SRQ-2026-TEST1234");
            req.setCreatedAt(LocalDateTime.now());
            req.setUpdatedAt(LocalDateTime.now());
            return req;
        });

        SourcingRequestDetailDto result = sourcingService.createRequest(dto, authentication);

        assertNotNull(result);
        assertEquals("Ascorbic Acid IP", result.productName());
        assertEquals("Pharmaceutical Ingredients", result.category());
        assertEquals(BigDecimal.valueOf(500), result.quantity());
        assertEquals("KG", result.unit());
        assertEquals("Hyderabad, Telangana", result.deliveryLocation());
        assertEquals(SourcingRequestStatus.SUBMITTED, result.status());

        verify(sourcingRequestRepository).save(any(SourcingRequest.class));
        verify(sourcingStatusHistoryRepository).save(any(SourcingStatusHistory.class));
    }

    @Test
    public void createRequest_inactiveBuyer_throwsAccessDenied() {
        buyer.setStatus(UserStatus.SUSPENDED);
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));

        CreateSourcingRequestDto dto = new CreateSourcingRequestDto(
                "Acetone", "Solvents", BigDecimal.TEN, "L", "Pune",
                null, null, null, null, null, null, "INR", null, null, null
        );

        assertThrows(AccessDeniedException.class, () -> sourcingService.createRequest(dto, authentication));
        verify(sourcingRequestRepository, never()).save(any());
    }

    @Test
    public void getMyRequests_returnsOnlyBuyerRequests() {
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));

        SourcingRequest r1 = new SourcingRequest();
        r1.setId(UUID.randomUUID());
        r1.setBuyerId(buyerId);
        r1.setProductName("Chemical A");
        r1.setCategory("Industrial Chemicals");
        r1.setTargetQuantity(BigDecimal.valueOf(100));
        r1.setUnit("KG");
        r1.setStatus(SourcingRequestStatus.SUBMITTED);
        r1.setCreatedAt(LocalDateTime.now());

        when(sourcingRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId)).thenReturn(List.of(r1));

        List<SourcingRequestSummaryDto> list = sourcingService.getMyRequests(authentication);

        assertEquals(1, list.size());
        assertEquals("Chemical A", list.get(0).productName());
    }

    @Test
    public void getRequestDetail_unauthorizedBuyer_throwsAccessDenied() {
        when(authentication.getName()).thenReturn("buyer@example.com");
        when(userRepository.findByEmail("buyer@example.com")).thenReturn(Optional.of(buyer));

        UUID otherBuyerId = UUID.randomUUID();
        SourcingRequest request = new SourcingRequest();
        UUID requestId = UUID.randomUUID();
        request.setId(requestId);
        request.setBuyerId(otherBuyerId); // Different buyer!
        request.setProductName("Restricted Chemical");
        request.setCategory("Specialty Chemicals");
        request.setTargetQuantity(BigDecimal.valueOf(50));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.SUBMITTED);

        when(sourcingRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

        assertThrows(AccessDeniedException.class, () -> sourcingService.getRequestDetail(requestId, authentication));
    }

    @Test
    public void getRequestDetail_adminAllowedForAnyRequest() {
        when(authentication.getName()).thenReturn("admin@kemkendra.com");
        when(userRepository.findByEmail("admin@kemkendra.com")).thenReturn(Optional.of(admin));

        UUID otherBuyerId = UUID.randomUUID();
        SourcingRequest request = new SourcingRequest();
        UUID requestId = UUID.randomUUID();
        request.setId(requestId);
        request.setBuyerId(otherBuyerId);
        request.setProductName("Specialty Monomer");
        request.setCategory("Specialty Chemicals");
        request.setTargetQuantity(BigDecimal.valueOf(500));
        request.setUnit("KG");
        request.setDeliveryLocation("Dahej, Gujarat");
        request.setStatus(SourcingRequestStatus.SUBMITTED);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        when(sourcingRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(userRepository.findById(otherBuyerId)).thenReturn(Optional.of(buyer));

        SourcingRequestDetailDto detail = sourcingService.getRequestDetail(requestId, authentication);

        assertNotNull(detail);
        assertEquals("Specialty Monomer", detail.productName());
    }

    @Test
    public void updateStatus_byAdmin_createsStatusHistory() {
        when(authentication.getName()).thenReturn("admin@kemkendra.com");
        when(userRepository.findByEmail("admin@kemkendra.com")).thenReturn(Optional.of(admin));

        UUID requestId = UUID.randomUUID();
        SourcingRequest request = new SourcingRequest();
        request.setId(requestId);
        request.setBuyerId(buyerId);
        request.setProductName("Active Ingredient B");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(200));
        request.setUnit("KG");
        request.setStatus(SourcingRequestStatus.SUBMITTED);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        when(sourcingRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(sourcingRequestRepository.save(any(SourcingRequest.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyer));

        UpdateSourcingStatusRequestDto updateDto = new UpdateSourcingStatusRequestDto(
                SourcingRequestStatus.SOURCING,
                "Suppliers identified across Gujarat network"
        );

        SourcingRequestDetailDto updated = sourcingService.updateStatus(requestId, updateDto, authentication);

        assertNotNull(updated);
        assertEquals(SourcingRequestStatus.SOURCING, updated.status());
        verify(sourcingStatusHistoryRepository).save(any(SourcingStatusHistory.class));
    }
}
