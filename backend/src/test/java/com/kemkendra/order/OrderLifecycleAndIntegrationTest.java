package com.kemkendra.order;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.order.dto.CreatePurchaseOrderRequest;
import com.kemkendra.order.dto.DispatchOrderRequest;
import com.kemkendra.order.dto.UpdateShipmentStatusRequest;
import com.kemkendra.product.MasterProduct;
import com.kemkendra.product.MasterProductRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.rfq.Rfq;
import com.kemkendra.rfq.RfqRepository;
import com.kemkendra.rfq.RfqStatus;
import com.kemkendra.rfq.quotation.Quotation;
import com.kemkendra.rfq.quotation.QuotationRepository;
import com.kemkendra.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OrderLifecycleAndIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private MasterProductRepository masterProductRepository;

    @Autowired
    private RfqRepository rfqRepository;

    @Autowired
    private QuotationRepository quotationRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ShipmentRepository shipmentRepository;

    private User buyer;
    private User supplierUser;
    private Supplier supplier;
    private MasterProduct masterProduct;
    private String buyerToken;
    private String supplierToken;

    @BeforeEach
    void setUp() {
        String uid = UUID.randomUUID().toString().substring(0, 8);

        buyer = new User();
        buyer.setName("Buyer " + uid);
        buyer.setEmail("orderbuyer." + uid + "@example.com");
        buyer.setPasswordHash("hash");
        buyer.setRole(UserRole.USER);
        buyer.setStatus(UserStatus.ACTIVE);
        buyer = userRepository.save(buyer);

        supplierUser = new User();
        supplierUser.setName("Supplier " + uid);
        supplierUser.setEmail("ordersupplier." + uid + "@example.com");
        supplierUser.setPasswordHash("hash");
        supplierUser.setRole(UserRole.SUPPLIER);
        supplierUser.setStatus(UserStatus.ACTIVE);
        supplierUser = userRepository.save(supplierUser);

        supplier = new Supplier();
        supplier.setUser(supplierUser);
        supplier.setName("Chem Corp " + uid);
        supplier.setVerified(true);
        supplier = supplierRepository.save(supplier);

        masterProduct = new MasterProduct();
        masterProduct.setName("Benzene Sulfonyl Chloride " + uid);
        masterProduct.setMasterProductCode("MP-" + uid.toUpperCase());
        masterProduct.setCategory(com.kemkendra.product.ProductCategory.SPECIALTY_CHEMICAL);
        masterProduct.setCasNumber("98-09-9");
        masterProduct.setStatus("ACTIVE");
        masterProduct = masterProductRepository.save(masterProduct);

        buyerToken = jwtService.generateToken(buyer);
        supplierToken = jwtService.generateToken(supplierUser);
    }

    private Rfq createAcceptedRfqAndQuotation() {
        Rfq rfq = new Rfq();
        rfq.setBuyerId(buyer.getId());
        rfq.setSupplierId(supplier.getId());
        rfq.setMasterProductId(masterProduct.getId());
        rfq.setQuantity(new BigDecimal("100.00"));
        rfq.setUnit("KG");
        rfq.setStatus(RfqStatus.ACCEPTED);
        rfq = rfqRepository.save(rfq);

        Quotation q = new Quotation();
        q.setRfq(rfq);
        q.setQuotationVersion(1);
        q.setUnitPrice(new BigDecimal("250.00"));
        q.setCurrency("INR");
        q.setLeadTimeDays(14);
        q.setValidityDate(LocalDate.now().plusDays(30));
        q = quotationRepository.save(q);

        rfq.setAcceptedQuotationId(q.getId());
        return rfqRepository.save(rfq);
    }

    @Test
    @DisplayName("1. Order creation calculates financial totals and prevents duplicate POs for the same RFQ")
    void testOrderCreationAndDuplicateGuard() throws Exception {
        Rfq rfq = createAcceptedRfqAndQuotation();

        CreatePurchaseOrderRequest req = new CreatePurchaseOrderRequest(
                rfq.getId(),
                "42 Chemical Park, Mumbai, India",
                "finance@buyer.com",
                "Please deliver in UN-certified drums",
                "Net 30",
                "Ex-Works",
                "EXW",
                LocalDate.now().plusDays(14),
                new BigDecimal("4500.00"), // 18% GST on 25000
                new BigDecimal("25000.00")
        );

        String res = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.poNumber", startsWith("PO-")))
                .andExpect(jsonPath("$.status", is("PLACED")))
                .andExpect(jsonPath("$.subtotal", is(25000.0)))
                .andExpect(jsonPath("$.taxAmount", is(4500.0)))
                .andExpect(jsonPath("$.totalAmount", is(29500.0)))
                .andExpect(jsonPath("$.expectedDeliveryDate", notNullValue()))
                .andReturn().getResponse().getContentAsString();

        // Attempting to issue second PO for same accepted RFQ must be rejected
        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("2. Complete order fulfillment workflow: Confirm -> Process -> Ready for Dispatch -> Dispatch -> In-Transit -> Deliver -> Complete")
    void testCompleteOrderFulfillmentWorkflow() throws Exception {
        Rfq rfq = createAcceptedRfqAndQuotation();

        CreatePurchaseOrderRequest createReq = new CreatePurchaseOrderRequest(
                rfq.getId(),
                "Warehouse 9, Dahej GIDC, Gujarat",
                "logistics@buyer.com",
                "Handle with dry nitrogen blanket"
        );

        String poResponseJson = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID orderId = UUID.fromString(objectMapper.readTree(poResponseJson).get("id").asText());

        // Step A: Supplier Confirms Order
        mockMvc.perform(post("/api/v1/orders/supplier/" + orderId + "/confirm")
                        .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("CONFIRMED")))
                .andExpect(jsonPath("$.confirmedAt", notNullValue()));

        // Step B: Supplier Starts Processing
        mockMvc.perform(post("/api/v1/orders/supplier/" + orderId + "/process")
                        .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("PROCESSING")))
                .andExpect(jsonPath("$.processingAt", notNullValue()));

        // Step C: Supplier Marks Ready For Dispatch
        mockMvc.perform(post("/api/v1/orders/supplier/" + orderId + "/ready-for-dispatch")
                        .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("READY_FOR_DISPATCH")))
                .andExpect(jsonPath("$.readyForDispatchAt", notNullValue()));

        // Step D: Supplier Dispatches Consignment with tracking and carrier
        DispatchOrderRequest dispatchReq = new DispatchOrderRequest(
                "TRK-987654321",
                "BlueDart Express Logistics",
                LocalDateTime.now(),
                LocalDate.now().plusDays(3),
                "Handed over to transport hub"
        );

        mockMvc.perform(post("/api/v1/orders/supplier/" + orderId + "/dispatch")
                        .header("Authorization", "Bearer " + supplierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dispatchReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DISPATCHED")))
                .andExpect(jsonPath("$.shippedAt", notNullValue()));

        // Step E: Supplier Updates Shipment to IN_TRANSIT
        UpdateShipmentStatusRequest transitReq = new UpdateShipmentStatusRequest(
                ShipmentStatus.IN_TRANSIT,
                "BlueDart Express Logistics",
                "TRK-987654321",
                LocalDate.now().plusDays(2),
                "Consignment reached regional distribution center"
        );

        mockMvc.perform(put("/api/v1/orders/supplier/" + orderId + "/shipment-status")
                        .header("Authorization", "Bearer " + supplierToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(transitReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipmentStatus", is("IN_TRANSIT")));

        // Verify order reflects IN_TRANSIT
        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("IN_TRANSIT")))
                .andExpect(jsonPath("$.inTransitAt", notNullValue()));

        // Step F: Buyer Confirms Consignment Receipt
        mockMvc.perform(post("/api/v1/orders/" + orderId + "/receive")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DELIVERED")))
                .andExpect(jsonPath("$.deliveredAt", notNullValue()));

        // Step G: Order Completion
        mockMvc.perform(post("/api/v1/orders/" + orderId + "/complete")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("COMPLETED")))
                .andExpect(jsonPath("$.completedAt", notNullValue()));

        // Step H: Verify Timeline Endpoint
        mockMvc.perform(get("/api/v1/orders/" + orderId + "/timeline")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(6))))
                .andExpect(jsonPath("$[0].step", is("QUOTATION_ACCEPTED")))
                .andExpect(jsonPath("$[1].step", is("ORDER_CREATED")));

        // Step I: Verify Invoice Summary Endpoint
        mockMvc.perform(get("/api/v1/orders/" + orderId + "/invoice-summary")
                        .header("Authorization", "Bearer " + buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(orderId.toString())))
                .andExpect(jsonPath("$.poNumber", notNullValue()));
    }

    @Test
    @DisplayName("3. IDOR and unauthorized cross-tenant order access is denied")
    void testCrossTenantOrderSecurity() throws Exception {
        Rfq rfq = createAcceptedRfqAndQuotation();

        CreatePurchaseOrderRequest createReq = new CreatePurchaseOrderRequest(
                rfq.getId(),
                "Address 1",
                "buyer@test.com",
                "Notes"
        );

        String poResponseJson = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + buyerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID orderId = UUID.fromString(objectMapper.readTree(poResponseJson).get("id").asText());

        // Create third-party intruder user
        User intruder = new User();
        intruder.setName("Intruder User");
        intruder.setEmail("intruder." + UUID.randomUUID() + "@example.com");
        intruder.setPasswordHash("hash");
        intruder.setRole(UserRole.USER);
        intruder.setStatus(UserStatus.ACTIVE);
        intruder = userRepository.save(intruder);
        String intruderToken = jwtService.generateToken(intruder);

        // Intruder accessing buyer order must receive 404 Not Found
        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + intruderToken))
                .andExpect(status().isNotFound());

        // Intruder attempting to cancel must receive 404 Not Found
        mockMvc.perform(post("/api/v1/orders/" + orderId + "/cancel")
                        .header("Authorization", "Bearer " + intruderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\": \"Unauthorized attempt to cancel\"}"))
                .andExpect(status().isNotFound());
    }
}
