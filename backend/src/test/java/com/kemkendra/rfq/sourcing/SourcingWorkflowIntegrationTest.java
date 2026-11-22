package com.kemkendra.rfq.sourcing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.rfq.sourcing.dto.CreateSourcingRequestDto;
import com.kemkendra.rfq.sourcing.dto.UpdateSourcingStatusRequestDto;
import com.kemkendra.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SourcingWorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SourcingRequestRepository sourcingRequestRepository;

    @Autowired
    private SourcingStatusHistoryRepository sourcingStatusHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User adminUser;
    private User buyerOne;
    private User buyerTwo;

    private String adminToken;
    private String buyerOneToken;
    private String buyerTwoToken;

    @BeforeEach
    public void setup() {
        jdbcTemplate.execute("DELETE FROM sourcing_status_history; " +
                "DELETE FROM sourcing_proposals; " +
                "DELETE FROM sourcing_quotations; " +
                "DELETE FROM sourcing_outreach_logs; " +
                "DELETE FROM sourcing_suppliers; " +
                "DELETE FROM sourcing_assignments; " +
                "UPDATE rfqs SET sourcing_request_id = NULL, accepted_quotation_id = NULL; " +
                "DELETE FROM buyer_shortlist_items; " +
                "DELETE FROM buyer_shortlists; " +
                "DELETE FROM sourcing_requests; " +
                "DELETE FROM documents; " +
                "DELETE FROM shipments; " +
                "DELETE FROM purchase_orders; " +
                "DELETE FROM quotations; " +
                "DELETE FROM rfqs; " +
                "DELETE FROM supplier_offerings; " +
                "DELETE FROM product_master_mappings; " +
                "DELETE FROM master_products; " +
                "DELETE FROM products; " +
                "DELETE FROM seller_profiles; " +
                "DELETE FROM suppliers; " +
                "DELETE FROM email_verification_tokens; " +
                "DELETE FROM password_reset_tokens; " +
                "DELETE FROM users;");

        adminUser = new User();
        adminUser.setName("Admin Director");
        adminUser.setEmail("admin.sourcing@kemkendra.com");
        adminUser.setPasswordHash(passwordEncoder.encode("Password123!"));
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEmailVerifiedAt(Instant.now());
        adminUser = userRepository.save(adminUser);
        adminToken = jwtService.generateToken(adminUser);

        buyerOne = new User();
        buyerOne.setName("Pharma Buyer 1");
        buyerOne.setEmail("buyer1@pharmatech.com");
        buyerOne.setPasswordHash(passwordEncoder.encode("Password123!"));
        buyerOne.setRole(UserRole.USER);
        buyerOne.setStatus(UserStatus.ACTIVE);
        buyerOne.setEmailVerifiedAt(Instant.now());
        buyerOne = userRepository.save(buyerOne);
        buyerOneToken = jwtService.generateToken(buyerOne);

        buyerTwo = new User();
        buyerTwo.setName("Chemical Buyer 2");
        buyerTwo.setEmail("buyer2@chemcorp.com");
        buyerTwo.setPasswordHash(passwordEncoder.encode("Password123!"));
        buyerTwo.setRole(UserRole.USER);
        buyerTwo.setStatus(UserStatus.ACTIVE);
        buyerTwo.setEmailVerifiedAt(Instant.now());
        buyerTwo = userRepository.save(buyerTwo);
        buyerTwoToken = jwtService.generateToken(buyerTwo);
    }

    @Test
    public void submitSourcingRequest_unauthenticated_returns401() throws Exception {
        CreateSourcingRequestDto dto = new CreateSourcingRequestDto(
                "Paracetamol IP",
                "Pharmaceutical Ingredients",
                BigDecimal.valueOf(500),
                "KG",
                "Mumbai, India",
                "103-90-2",
                "Pharma Grade",
                "Purity >= 99.5%",
                "IP",
                "25 KG Fiber Drums",
                BigDecimal.valueOf(450.00),
                "INR",
                LocalDate.now().plusMonths(1),
                "Need COA and GMP Certificate",
                null
        );

        mockMvc.perform(post("/api/v1/sourcing/requests")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void submitSourcingRequest_authenticatedBuyer_returns201WithReferenceAndStatus() throws Exception {
        CreateSourcingRequestDto dto = new CreateSourcingRequestDto(
                "Paracetamol IP",
                "Pharmaceutical Ingredients",
                BigDecimal.valueOf(500.00),
                "KG",
                "Mumbai, Maharashtra",
                "103-90-2",
                "Pharma Grade",
                "Purity >= 99.5%",
                "IP",
                "25 KG Fiber Drums",
                BigDecimal.valueOf(450.00),
                "INR",
                LocalDate.now().plusMonths(1),
                "Need COA and GMP Certificate",
                "doc-ref-12345"
        );

        mockMvc.perform(post("/api/v1/sourcing/requests")
                        .header("Authorization", "Bearer " + buyerOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.sourcingRequestReference", startsWith("SRQ-")))
                .andExpect(jsonPath("$.productName", is("Paracetamol IP")))
                .andExpect(jsonPath("$.category", is("Pharmaceutical Ingredients")))
                .andExpect(jsonPath("$.quantity", is(500.00)))
                .andExpect(jsonPath("$.unit", is("KG")))
                .andExpect(jsonPath("$.deliveryLocation", is("Mumbai, Maharashtra")))
                .andExpect(jsonPath("$.status", is("SUBMITTED")))
                .andExpect(jsonPath("$.statusHistory", hasSize(1)))
                .andExpect(jsonPath("$.statusHistory[0].newStatus", is("SUBMITTED")));
    }

    @Test
    public void submitSourcingRequest_validationError_returns400() throws Exception {
        // Missing required fields (productName, category, quantity, unit, deliveryLocation)
        CreateSourcingRequestDto invalidDto = new CreateSourcingRequestDto(
                "",
                "",
                BigDecimal.ZERO,
                "",
                "",
                null, null, null, null, null, null, null, null, null, null
        );

        mockMvc.perform(post("/api/v1/sourcing/requests")
                        .header("Authorization", "Bearer " + buyerOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void getMyRequests_returnsOnlyBuyerOwnRequests() throws Exception {
        // Buyer 1 creates a request
        CreateSourcingRequestDto dto1 = new CreateSourcingRequestDto(
                "Acetaminophen USP", "Pharmaceutical Ingredients",
                BigDecimal.valueOf(100), "KG", "Hyderabad",
                null, null, null, null, null, null, "INR", null, null, null
        );
        mockMvc.perform(post("/api/v1/sourcing/requests")
                        .header("Authorization", "Bearer " + buyerOneToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto1)))
                .andExpect(status().isCreated());

        // Buyer 2 creates a request
        CreateSourcingRequestDto dto2 = new CreateSourcingRequestDto(
                "Methanol HPLC", "Solvents",
                BigDecimal.valueOf(2000), "L", "Gujarat",
                null, null, null, null, null, null, "INR", null, null, null
        );
        mockMvc.perform(post("/api/v1/sourcing/requests")
                        .header("Authorization", "Bearer " + buyerTwoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto2)))
                .andExpect(status().isCreated());

        // Buyer 1 queries /my
        mockMvc.perform(get("/api/v1/sourcing/requests/my")
                        .header("Authorization", "Bearer " + buyerOneToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productName", is("Acetaminophen USP")));

        // Buyer 2 queries /my
        mockMvc.perform(get("/api/v1/sourcing/requests/my")
                        .header("Authorization", "Bearer " + buyerTwoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].productName", is("Methanol HPLC")));
    }

    @Test
    public void getRequestDetail_enforcesBuyerIsolation() throws Exception {
        // Buyer 1 creates request
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyerOne.getId());
        request.setProductName("Sodium Hydroxide Pellets");
        request.setCategory("Industrial Chemicals");
        request.setTargetQuantity(BigDecimal.valueOf(1000));
        request.setUnit("KG");
        request.setDeliveryLocation("Chennai");
        request.setStatus(SourcingRequestStatus.SUBMITTED);
        SourcingRequest saved = sourcingRequestRepository.save(request);

        // Buyer 1 can access own request
        mockMvc.perform(get("/api/v1/sourcing/requests/" + saved.getId())
                        .header("Authorization", "Bearer " + buyerOneToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())))
                .andExpect(jsonPath("$.productName", is("Sodium Hydroxide Pellets")));

        // Buyer 2 cannot access Buyer 1's request -> 403 Forbidden
        mockMvc.perform(get("/api/v1/sourcing/requests/" + saved.getId())
                        .header("Authorization", "Bearer " + buyerTwoToken))
                .andExpect(status().isForbidden());

        // Admin can access Buyer 1's request
        mockMvc.perform(get("/api/v1/sourcing/requests/" + saved.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(saved.getId().toString())));
    }

    @Test
    public void adminEndpoints_enforceAdminRoleAndLifecycleTransitions() throws Exception {
        // Buyer 1 creates request
        SourcingRequest request = new SourcingRequest();
        request.setBuyerId(buyerOne.getId());
        request.setProductName("Ibuprofen BP");
        request.setCategory("APIs");
        request.setTargetQuantity(BigDecimal.valueOf(250));
        request.setUnit("KG");
        request.setDeliveryLocation("Pune");
        request.setStatus(SourcingRequestStatus.SUBMITTED);
        SourcingRequest saved = sourcingRequestRepository.save(request);

        // Non-admin accessing admin endpoints -> 403 Forbidden
        mockMvc.perform(get("/api/v1/admin/sourcing/requests")
                        .header("Authorization", "Bearer " + buyerOneToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/sourcing/requests/" + saved.getId())
                        .header("Authorization", "Bearer " + buyerOneToken))
                .andExpect(status().isForbidden());

        // Admin lists sourcing requests
        mockMvc.perform(get("/api/v1/admin/sourcing/requests")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].productName", is("Ibuprofen BP")));

        // Admin updates status from SUBMITTED to SOURCING
        UpdateSourcingStatusRequestDto statusUpdate = new UpdateSourcingStatusRequestDto(
                SourcingRequestStatus.SOURCING,
                "Assigned to procurement team; reaching out to 3 API manufacturers"
        );

        mockMvc.perform(patch("/api/v1/admin/sourcing/requests/" + saved.getId() + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusUpdate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("SOURCING")))
                .andExpect(jsonPath("$.statusHistory", hasSize(1)))
                .andExpect(jsonPath("$.statusHistory[0].previousStatus", is("SUBMITTED")))
                .andExpect(jsonPath("$.statusHistory[0].newStatus", is("SOURCING")))
                .andExpect(jsonPath("$.statusHistory[0].reasonOrNotes", containsString("Assigned to procurement team")));

        // Verify database state
        SourcingRequest reloaded = sourcingRequestRepository.findById(saved.getId()).orElseThrow();
        assertEquals(SourcingRequestStatus.SOURCING, reloaded.getStatus());
    }
}
