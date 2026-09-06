package com.kemkendra.admin.analytics;

import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.product.Supplier;
import com.kemkendra.product.SupplierRepository;
import com.kemkendra.security.JwtService;
import com.kemkendra.seller.SupplierVerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AnalyticsSecurityAndIsolationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private String adminToken;
    private String buyerToken;
    private String supplierToken;

    private User adminUser;
    private User buyerUser;
    private User supplierUser;
    private Supplier supplier;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("UPDATE rfqs SET accepted_quotation_id = NULL; " +
                "DELETE FROM invoice_payment_records; " +
                "DELETE FROM disputes; " +
                "DELETE FROM invoices; " +
                "DELETE FROM documents; " +
                "DELETE FROM shipments; " +
                "DELETE FROM purchase_orders; " +
                "DELETE FROM quotations; " +
                "DELETE FROM rfqs; " +
                "DELETE FROM supplier_offerings; " +
                "DELETE FROM master_products; " +
                "DELETE FROM product_analytics_events; " +
                "DELETE FROM products; " +
                "DELETE FROM seller_profiles; " +
                "DELETE FROM suppliers; " +
                "DELETE FROM users;");

        // Admin
        adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin.security@kemkendra.com");
        adminUser.setPasswordHash("hash123");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser.setEmailVerifiedAt(Instant.now());
        adminUser = userRepository.save(adminUser);
        adminToken = "Bearer " + jwtService.generateToken(adminUser);

        // Buyer
        buyerUser = new User();
        buyerUser.setName("Buyer User");
        buyerUser.setEmail("buyer.security@kemkendra.com");
        buyerUser.setPasswordHash("hash123");
        buyerUser.setRole(UserRole.USER);
        buyerUser.setStatus(UserStatus.ACTIVE);
        buyerUser.setEmailVerifiedAt(Instant.now());
        buyerUser = userRepository.save(buyerUser);
        buyerToken = "Bearer " + jwtService.generateToken(buyerUser);

        // Supplier
        supplierUser = new User();
        supplierUser.setName("Supplier User");
        supplierUser.setEmail("supplier.security@kemkendra.com");
        supplierUser.setPasswordHash("hash123");
        supplierUser.setRole(UserRole.SUPPLIER);
        supplierUser.setStatus(UserStatus.ACTIVE);
        supplierUser.setEmailVerifiedAt(Instant.now());
        supplierUser = userRepository.save(supplierUser);
        supplierToken = "Bearer " + jwtService.generateToken(supplierUser);

        supplier = new Supplier();
        supplier.setName("Omega Chem Corp");
        supplier.setVerificationStatus(SupplierVerificationStatus.VERIFIED);
        supplier.setUser(supplierUser);
        supplier.setCreatedAt(LocalDateTime.now().minusDays(5));
        supplier = supplierRepository.save(supplier);
    }

    @Test
    @DisplayName("Admin has full access to platform analytics and reports")
    void testAdminAccessPermitted() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/analytics/rfqs")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/analytics/orders")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/analytics/suppliers")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/analytics/products")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/analytics/invoices")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Non-Admin users are strictly denied from platform-level admin analytics")
    void testNonAdminAccessDenied() throws Exception {
        // Buyer blocked
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", buyerToken))
                .andExpect(status().isForbidden());

        // Supplier blocked
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard")
                        .header("Authorization", supplierToken))
                .andExpect(status().isForbidden());

        // Unauthenticated blocked
        mockMvc.perform(get("/api/v1/admin/analytics/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Buyer and Supplier role isolation between analytics endpoints")
    void testRoleIsolation() throws Exception {
        // Buyer can access buyer analytics summary
        mockMvc.perform(get("/api/v1/buyer/analytics/summary")
                        .header("Authorization", buyerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRfqs", is(0)));

        // Buyer cannot access supplier analytics summary
        mockMvc.perform(get("/api/v1/supplier/analytics/summary")
                        .header("Authorization", buyerToken))
                .andExpect(status().isForbidden());

        // Supplier can access supplier analytics summary
        mockMvc.perform(get("/api/v1/supplier/analytics/summary")
                        .header("Authorization", supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rfqsReceived", is(0)));

        // Supplier cannot access buyer analytics summary
        mockMvc.perform(get("/api/v1/buyer/analytics/summary")
                        .header("Authorization", supplierToken))
                .andExpect(status().isForbidden());
    }
}
