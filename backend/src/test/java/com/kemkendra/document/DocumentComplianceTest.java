package com.kemkendra.document;

import com.kemkendra.document.storage.StorageService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.product.Product;
import com.kemkendra.product.ProductCategory;
import com.kemkendra.product.ProductRepository;
import com.kemkendra.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class DocumentComplianceTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DocumentComplianceScheduler complianceScheduler;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @TempDir
    static Path tempStorageDir;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("kemkendra.storage.local.root", () -> tempStorageDir.toAbsolutePath().toString());
    }

    private User adminUser;
    private User supplierUser;
    private User otherSupplier;
    private String adminToken;
    private String supplierToken;
    private String otherToken;
    private Product supplierProduct;

    @BeforeEach
    public void setUp() {
        jdbcTemplate.execute("UPDATE rfqs SET accepted_quotation_id = NULL; DELETE FROM buyer_shortlist_items; DELETE FROM buyer_shortlists; DELETE FROM governance_audit_logs; DELETE FROM audit_logs; DELETE FROM notifications; DELETE FROM supplier_offering_verification_evidences; DELETE FROM supplier_offering_audits; DELETE FROM supplier_verification_evidences; DELETE FROM supplier_verification_audits; DELETE FROM product_requests; DELETE FROM sourcing_requests; DELETE FROM documents; DELETE FROM shipments; DELETE FROM purchase_orders; DELETE FROM quotations; DELETE FROM rfqs; DELETE FROM supplier_offerings; DELETE FROM product_master_mappings; DELETE FROM master_products; DELETE FROM product_images; DELETE FROM product_suppliers; DELETE FROM products; DELETE FROM seller_profiles; DELETE FROM suppliers; DELETE FROM email_verification_tokens; DELETE FROM password_reset_tokens; DELETE FROM users;");

        adminUser = new User();
        adminUser.setEmail("admin.compliance@kemkendra.com");
        adminUser.setName("Compliance Admin");
        adminUser.setPasswordHash("hash123");
        adminUser.setRole(UserRole.ADMIN);
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);
        adminToken = jwtService.generateToken(adminUser);

        supplierUser = new User();
        supplierUser.setEmail("supplier.compliance@kemkendra.com");
        supplierUser.setName("Supplier One");
        supplierUser.setPasswordHash("hash123");
        supplierUser.setRole(UserRole.USER);
        supplierUser.setStatus(UserStatus.ACTIVE);
        supplierUser = userRepository.save(supplierUser);
        supplierToken = jwtService.generateToken(supplierUser);

        otherSupplier = new User();
        otherSupplier.setEmail("other.supplier@kemkendra.com");
        otherSupplier.setName("Supplier Two");
        otherSupplier.setPasswordHash("hash123");
        otherSupplier.setRole(UserRole.USER);
        otherSupplier.setStatus(UserStatus.ACTIVE);
        otherSupplier = userRepository.save(otherSupplier);
        otherToken = jwtService.generateToken(otherSupplier);

        supplierProduct = new Product();
        supplierProduct.setName("Compliance Test Chemical");
        supplierProduct.setDescription("Chemical for compliance validation");
        supplierProduct.setCategory(ProductCategory.API);
        supplierProduct.setPrice(new java.math.BigDecimal("120.00"));
        supplierProduct.setStock(500);
        supplierProduct.setSeller(supplierUser);
        supplierProduct.setCoaAvailable(false);
        supplierProduct.setMsdsAvailable(false);
        supplierProduct = productRepository.save(supplierProduct);
    }

    @Test
    public void testSupplierUploadSetsPendingReview_AdminUploadSetsApproved() throws Exception {
        MockMultipartFile supplierFile = new MockMultipartFile(
                "file", "license.pdf", "application/pdf", "%PDF-1.4 test supplier license".getBytes()
        );

        // Supplier upload
        mockMvc.perform(multipart("/api/v1/documents")
                .file(supplierFile)
                .param("ownerType", "PRODUCT")
                .param("ownerId", supplierProduct.getId().toString())
                .param("category", "MANUFACTURING_LICENSE")
                .param("title", "Manufacturing License 2026")
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.title").value("Manufacturing License 2026"));

        // Admin upload
        MockMultipartFile adminFile = new MockMultipartFile(
                "file", "admin_spec.pdf", "application/pdf", "%PDF-1.4 test admin spec".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents")
                .file(adminFile)
                .param("ownerType", "PRODUCT")
                .param("ownerId", supplierProduct.getId().toString())
                .param("category", "TECHNICAL_SPECIFICATION")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }

    @Test
    public void testAdminCanApproveAndRejectDocument() throws Exception {
        // 1. Supplier uploads document
        MockMultipartFile file = new MockMultipartFile(
                "file", "product_spec.pdf", "application/pdf", "%PDF-1.4 test product specification".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents")
                .file(file)
                .param("ownerType", "PRODUCT")
                .param("ownerId", supplierProduct.getId().toString())
                .param("category", "TECHNICAL_SPECIFICATION")
                .param("title", "Technical Spec 2026")
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"));

        Document doc = documentRepository.findAll().get(0);
        assertEquals(DocumentStatus.PENDING_REVIEW, doc.getStatus());

        // 2. Admin approves document
        mockMvc.perform(post("/api/v1/admin/documents/{id}/approve", doc.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"notes\":\"Document verified against spec criteria.\"}")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.reviewedBy").value(adminUser.getId().toString()))
                .andExpect(jsonPath("$.reviewNotes").value("Document verified against spec criteria."));

        Document approvedDoc = documentRepository.findById(doc.getId()).orElseThrow();
        assertEquals(DocumentStatus.APPROVED, approvedDoc.getStatus());
        assertNotNull(approvedDoc.getReviewedAt());

        // 3. Admin rejects document
        mockMvc.perform(post("/api/v1/admin/documents/{id}/reject", doc.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"Document expiry date is not visible.\"}")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"))
                .andExpect(jsonPath("$.reviewNotes").value("Document expiry date is not visible."));

        Document rejectedDoc = documentRepository.findById(doc.getId()).orElseThrow();
        assertEquals(DocumentStatus.REJECTED, rejectedDoc.getStatus());
    }

    @Test
    public void testDocumentLineageAndReplacement() throws Exception {
        // 1. Upload initial version
        MockMultipartFile v1File = new MockMultipartFile(
                "file", "coa_v1.pdf", "application/pdf", "%PDF-1.4 COA V1 content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents")
                .file(v1File)
                .param("ownerType", "PRODUCT")
                .param("ownerId", supplierProduct.getId().toString())
                .param("category", "COA")
                .param("title", "COA Batch 101")
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(1));

        Document v1 = documentRepository.findAll().get(0);
        UUID groupId = v1.getDocumentGroupId();
        assertEquals(1, v1.getVersion());
        assertTrue(v1.getIsActive());

        // 2. Upload replacement version
        MockMultipartFile v2File = new MockMultipartFile(
                "file", "coa_v2.pdf", "application/pdf", "%PDF-1.4 COA V2 updated content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents")
                .file(v2File)
                .param("ownerType", "PRODUCT")
                .param("ownerId", supplierProduct.getId().toString())
                .param("category", "COA")
                .param("title", "COA Batch 101 - Corrected")
                .param("documentGroupId", groupId.toString())
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.version").value(2))
                .andExpect(jsonPath("$.documentGroupId").value(groupId.toString()));

        // 3. Verify V1 is now REPLACED, isActive = false, replaced_by_id = V2 id
        Document updatedV1 = documentRepository.findById(v1.getId()).orElseThrow();
        assertEquals(DocumentStatus.REPLACED, updatedV1.getStatus());
        assertFalse(updatedV1.getIsActive());
        assertNotNull(updatedV1.getReplacedById());

        Document v2 = documentRepository.findById(updatedV1.getReplacedById()).orElseThrow();
        assertEquals(2, v2.getVersion());
        assertEquals(groupId, v2.getDocumentGroupId());
        assertTrue(v2.getIsActive());

        // 4. Verify version history endpoint returns both versions in chronological order
        mockMvc.perform(get("/api/v1/documents/{id}/versions", v2.getId())
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].version").value(2))
                .andExpect(jsonPath("$[1].version").value(1));
    }

    @Test
    public void testComplianceSchedulerMarksExpiredDocumentsWithoutDeletion() throws Exception {
        // Create an active document with expiryDate in the past
        Document expiredDoc = new Document();
        expiredDoc.setOriginalFileName("old_license.pdf");
        String key = "documents/test_expired.pdf";
        expiredDoc.setStorageKey(key);
        expiredDoc.setMimeType("application/pdf");
        expiredDoc.setFileSize(100L);
        expiredDoc.setOwnerType(DocumentOwnerType.PRODUCT);
        expiredDoc.setOwnerId(supplierProduct.getId());
        expiredDoc.setCategory(DocumentCategory.MANUFACTURING_LICENSE);
        expiredDoc.setDocumentGroupId(UUID.randomUUID());
        expiredDoc.setVersion(1);
        expiredDoc.setIsActive(true);
        expiredDoc.setStatus(DocumentStatus.APPROVED);
        expiredDoc.setExpiryDate(LocalDate.now().minusDays(2));
        expiredDoc.setUploadedBy(supplierUser.getId());
        expiredDoc = documentRepository.save(expiredDoc);
        storageService.store(key, new java.io.ByteArrayInputStream("dummy content".getBytes()));

        // Run compliance scheduler
        complianceScheduler.processExpiredDocuments();

        // Verify document is now marked EXPIRED, is_active is now false, but NOT deleted from DB or storage
        Document checked = documentRepository.findById(expiredDoc.getId()).orElseThrow();
        assertEquals(DocumentStatus.EXPIRED, checked.getStatus());
        assertFalse(checked.getIsActive());
        assertTrue(documentRepository.existsById(expiredDoc.getId()));
        assertTrue(storageService.exists(expiredDoc.getStorageKey()));
    }

    @Test
    public void testPublicDocumentAccessibleWithoutAuth_PrivateRequiresAuth() throws Exception {
        // 1. Create a public document
        Document publicDoc = new Document();
        publicDoc.setOriginalFileName("public_sds.pdf");
        String pubKey = "documents/public_sds.pdf";
        publicDoc.setStorageKey(pubKey);
        publicDoc.setMimeType("application/pdf");
        publicDoc.setFileSize(120L);
        publicDoc.setOwnerType(DocumentOwnerType.PRODUCT);
        publicDoc.setOwnerId(supplierProduct.getId());
        publicDoc.setCategory(DocumentCategory.MSDS);
        publicDoc.setDocumentGroupId(UUID.randomUUID());
        publicDoc.setVersion(1);
        publicDoc.setIsActive(true);
        publicDoc.setIsPublic(true);
        publicDoc.setStatus(DocumentStatus.APPROVED);
        publicDoc.setUploadedBy(supplierUser.getId());
        publicDoc = documentRepository.save(publicDoc);
        storageService.store(pubKey, new java.io.ByteArrayInputStream("public sds data".getBytes()));

        // Public document download without any auth header -> 200 OK
        mockMvc.perform(get("/api/v1/documents/{id}/download", publicDoc.getId()))
                .andExpect(status().isOk())
                .andExpect(content().string("public sds data"));

        // 2. Create a private document
        Document privateDoc = new Document();
        privateDoc.setOriginalFileName("confidential_spec.pdf");
        String privKey = "documents/confidential_spec.pdf";
        privateDoc.setStorageKey(privKey);
        privateDoc.setMimeType("application/pdf");
        privateDoc.setFileSize(150L);
        privateDoc.setOwnerType(DocumentOwnerType.PRODUCT);
        privateDoc.setOwnerId(supplierProduct.getId());
        privateDoc.setCategory(DocumentCategory.TECHNICAL_SPECIFICATION);
        privateDoc.setDocumentGroupId(UUID.randomUUID());
        privateDoc.setVersion(1);
        privateDoc.setIsActive(true);
        privateDoc.setIsPublic(false);
        privateDoc.setStatus(DocumentStatus.PENDING_REVIEW);
        privateDoc.setUploadedBy(supplierUser.getId());
        privateDoc = documentRepository.save(privateDoc);
        storageService.store(privKey, new java.io.ByteArrayInputStream("private spec".getBytes()));

        // Private document without auth -> 403 Forbidden
        mockMvc.perform(get("/api/v1/documents/{id}/download", privateDoc.getId()))
                .andExpect(status().isForbidden());

        // Private document by owner -> 200 OK
        mockMvc.perform(get("/api/v1/documents/{id}/download", privateDoc.getId())
                .header("Authorization", "Bearer " + supplierToken))
                .andExpect(status().isOk())
                .andExpect(content().string("private spec"));

        // Private document by admin -> 200 OK
        mockMvc.perform(get("/api/v1/documents/{id}/download", privateDoc.getId())
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    public void testAdminComplianceStatsEndpoint() throws Exception {
        // Create 1 pending, 1 approved
        Document d1 = new Document();
        d1.setOriginalFileName("d1.pdf");
        d1.setStorageKey("documents/d1.pdf");
        d1.setMimeType("application/pdf");
        d1.setFileSize(10L);
        d1.setOwnerType(DocumentOwnerType.PRODUCT);
        d1.setOwnerId(supplierProduct.getId());
        d1.setCategory(DocumentCategory.COA);
        d1.setDocumentGroupId(UUID.randomUUID());
        d1.setVersion(1);
        d1.setIsActive(true);
        d1.setStatus(DocumentStatus.PENDING_REVIEW);
        d1.setUploadedBy(supplierUser.getId());
        documentRepository.save(d1);

        Document d2 = new Document();
        d2.setOriginalFileName("d2.pdf");
        d2.setStorageKey("documents/d2.pdf");
        d2.setMimeType("application/pdf");
        d2.setFileSize(10L);
        d2.setOwnerType(DocumentOwnerType.PRODUCT);
        d2.setOwnerId(supplierProduct.getId());
        d2.setCategory(DocumentCategory.MSDS);
        d2.setDocumentGroupId(UUID.randomUUID());
        d2.setVersion(1);
        d2.setIsActive(true);
        d2.setStatus(DocumentStatus.APPROVED);
        d2.setUploadedBy(supplierUser.getId());
        documentRepository.save(d2);

        mockMvc.perform(get("/api/v1/admin/documents/stats")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCount").value(2))
                .andExpect(jsonPath("$.pendingReviewCount").value(1))
                .andExpect(jsonPath("$.approvedCount").value(1));
    }
}
