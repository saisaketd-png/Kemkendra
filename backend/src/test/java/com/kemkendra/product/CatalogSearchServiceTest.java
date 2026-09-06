package com.kemkendra.product;

import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.product.dto.ProductSearchQueryCriteria;
import com.kemkendra.product.dto.SearchProductCardResponse;
import com.kemkendra.product.dto.SearchSuggestionResponse;
import com.kemkendra.seller.SupplierVerificationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatalogSearchServiceTest {

    @Autowired
    private CatalogSearchService catalogSearchService;

    @Autowired
    private MasterProductRepository masterProductRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private SupplierOfferingRepository supplierOfferingRepository;

    @Autowired
    private ProductSynonymRepository productSynonymRepository;

    @Autowired
    private UserRepository userRepository;

    private MasterProduct paracetamol;
    private MasterProduct ibuprofen;
    private MasterProduct deletedProduct;
    private Supplier activeSupplier;
    private Supplier suspendedSupplier;

    @BeforeEach
    void setUp() {
        // 1. Create users
        User supplierUser = new User();
        supplierUser.setEmail("supplier-search-" + UUID.randomUUID() + "@example.com");
        supplierUser.setPasswordHash("hashedpassword");
        supplierUser.setName("Active Chemical Corp");
        supplierUser.setRole(UserRole.SUPPLIER);
        supplierUser.setStatus(UserStatus.ACTIVE);
        supplierUser = userRepository.save(supplierUser);

        User suspendedUser = new User();
        suspendedUser.setEmail("suspended-search-" + UUID.randomUUID() + "@example.com");
        suspendedUser.setPasswordHash("hashedpassword");
        suspendedUser.setName("Suspended Supplier Ltd");
        suspendedUser.setRole(UserRole.SUPPLIER);
        suspendedUser.setStatus(UserStatus.SUSPENDED);
        suspendedUser = userRepository.save(suspendedUser);

        // 2. Create suppliers
        activeSupplier = new Supplier();
        activeSupplier.setName("Aarti Chemtech");
        activeSupplier.setSlug("aarti-chemtech-" + UUID.randomUUID());
        activeSupplier.setCountryName("India");
        activeSupplier.setUser(supplierUser);
        activeSupplier.setVerified(true);
        activeSupplier.setVerificationStatus(SupplierVerificationStatus.VERIFIED);
        activeSupplier = supplierRepository.save(activeSupplier);

        suspendedSupplier = new Supplier();
        suspendedSupplier.setName("Banned Chemicals Ltd");
        suspendedSupplier.setSlug("banned-chem-" + UUID.randomUUID());
        suspendedSupplier.setCountryName("Germany");
        suspendedSupplier.setUser(suspendedUser);
        suspendedSupplier.setVerified(true);
        suspendedSupplier.setVerificationStatus(SupplierVerificationStatus.SUSPENDED);
        suspendedSupplier = supplierRepository.save(suspendedSupplier);

        // 3. Create active products
        paracetamol = new MasterProduct();
        paracetamol.setMasterProductCode("MP-PARA-001");
        paracetamol.setName("Paracetamol Pure");
        paracetamol.setCasNumber("103-90-2");
        paracetamol.setMolecularFormula("C8H9NO2");
        paracetamol.setCategory(ProductCategory.API);
        paracetamol.setDescription("Analgesic and antipyretic active pharmaceutical ingredient");
        paracetamol.setStatus("ACTIVE");
        paracetamol = masterProductRepository.save(paracetamol);

        // Add approved synonym to Paracetamol
        ProductSynonym acetaminophenSyn = new ProductSynonym(paracetamol, "Acetaminophen", SynonymSource.OFFICIAL, supplierUser);
        acetaminophenSyn.setStatus(SynonymStatus.APPROVED);
        productSynonymRepository.save(acetaminophenSyn);

        // Add offering for Paracetamol from active supplier
        SupplierOffering off1 = new SupplierOffering();
        off1.setMasterProduct(paracetamol);
        off1.setSupplier(activeSupplier);
        off1.setPrice(new BigDecimal("350.00"));
        off1.setCurrency("INR");
        off1.setPurity(new BigDecimal("99.80"));
        off1.setGrade("Pharma Grade");
        off1.setStock(500);
        off1.setAvailabilityStatus("AVAILABLE");
        off1.setModerationStatus("APPROVED");
        off1.setCoaAvailable(true);
        off1.setMsdsAvailable(true);
        off1.setExportReady(true);
        supplierOfferingRepository.save(off1);

        // 4. Create Ibuprofen
        ibuprofen = new MasterProduct();
        ibuprofen.setMasterProductCode("MP-IBU-002");
        ibuprofen.setName("Ibuprofen BP/USP");
        ibuprofen.setCasNumber("15687-27-1");
        ibuprofen.setMolecularFormula("C13H18O2");
        ibuprofen.setCategory(ProductCategory.API);
        ibuprofen.setDescription("Nonsteroidal anti-inflammatory drug");
        ibuprofen.setStatus("ACTIVE");
        ibuprofen = masterProductRepository.save(ibuprofen);

        SupplierOffering off2 = new SupplierOffering();
        off2.setMasterProduct(ibuprofen);
        off2.setSupplier(activeSupplier);
        off2.setPrice(new BigDecimal("620.00"));
        off2.setCurrency("INR");
        off2.setPurity(new BigDecimal("99.20"));
        off2.setGrade("USP Grade");
        off2.setStock(200);
        off2.setAvailabilityStatus("AVAILABLE");
        off2.setModerationStatus("APPROVED");
        supplierOfferingRepository.save(off2);

        // 5. Create deleted/deactivated product
        deletedProduct = new MasterProduct();
        deletedProduct.setMasterProductCode("MP-DEL-999");
        deletedProduct.setName("Deleted Chemical Compound");
        deletedProduct.setCasNumber("999-99-9");
        deletedProduct.setCategory(ProductCategory.SPECIALTY_CHEMICAL);
        deletedProduct.setStatus("INACTIVE");
        deletedProduct.setDeactivatedAt(LocalDateTime.now());
        deletedProduct = masterProductRepository.save(deletedProduct);

        // Offering from suspended supplier
        SupplierOffering suspendedOff = new SupplierOffering();
        suspendedOff.setMasterProduct(deletedProduct);
        suspendedOff.setSupplier(suspendedSupplier);
        suspendedOff.setPrice(new BigDecimal("100.00"));
        suspendedOff.setStock(10);
        suspendedOff.setAvailabilityStatus("AVAILABLE");
        suspendedOff.setModerationStatus("APPROVED");
        supplierOfferingRepository.save(suspendedOff);
    }

    @Test
    @DisplayName("Should find product by exact chemical name")
    void testSearchByExactChemicalName() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                "Paracetamol Pure", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent().get(0).name()).isEqualTo("Paracetamol Pure");
        assertThat(page.getContent().get(0).casNumber()).isEqualTo("103-90-2");
    }

    @Test
    @DisplayName("Should find product by partial chemical name (case-insensitive)")
    void testSearchByPartialChemicalName() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                "paracet", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent().get(0).name()).isEqualTo("Paracetamol Pure");
    }

    @Test
    @DisplayName("Should find product by CAS number and stripped digits")
    void testSearchByCasNumber() {
        // Hyphenated
        ProductSearchQueryCriteria criteria1 = new ProductSearchQueryCriteria(
                "103-90-2", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );
        Page<SearchProductCardResponse> page1 = catalogSearchService.searchCatalog(criteria1);
        assertThat(page1.getContent()).isNotEmpty();
        assertThat(page1.getContent().get(0).casNumber()).isEqualTo("103-90-2");

        // Stripped digits
        ProductSearchQueryCriteria criteria2 = new ProductSearchQueryCriteria(
                "103902", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );
        Page<SearchProductCardResponse> page2 = catalogSearchService.searchCatalog(criteria2);
        assertThat(page2.getContent()).isNotEmpty();
        assertThat(page2.getContent().get(0).casNumber()).isEqualTo("103-90-2");
    }

    @Test
    @DisplayName("Should find product through approved synonym")
    void testSearchByApprovedSynonym() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                "Acetaminophen", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent().get(0).name()).isEqualTo("Paracetamol Pure");
    }

    @Test
    @DisplayName("Should filter by category and purity range")
    void testSearchWithCategoryAndPurityFilter() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                null, ProductCategory.API, new BigDecimal("99.50"), new BigDecimal("100.00"),
                null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isNotEmpty();
        assertThat(page.getContent()).allMatch(p -> p.category() == ProductCategory.API);
        assertThat(page.getContent()).allMatch(p -> p.maxPurity().compareTo(new BigDecimal("99.50")) >= 0);
    }

    @Test
    @DisplayName("Should exclude deleted products and suspended suppliers")
    void testExcludesDeletedAndSuspended() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                "Deleted", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isEmpty();
    }

    @Test
    @DisplayName("Should sort by price ascending and descending")
    void testSortingByPrice() {
        ProductSearchQueryCriteria ascCriteria = new ProductSearchQueryCriteria(
                null, ProductCategory.API, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "price_asc", 0, 10
        );
        Page<SearchProductCardResponse> ascPage = catalogSearchService.searchCatalog(ascCriteria);
        assertThat(ascPage.getContent()).hasSize(2);
        assertThat(ascPage.getContent().get(0).minStartingPrice()).isLessThanOrEqualTo(ascPage.getContent().get(1).minStartingPrice());

        ProductSearchQueryCriteria descCriteria = new ProductSearchQueryCriteria(
                null, ProductCategory.API, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "price_desc", 0, 10
        );
        Page<SearchProductCardResponse> descPage = catalogSearchService.searchCatalog(descCriteria);
        assertThat(descPage.getContent()).hasSize(2);
        assertThat(descPage.getContent().get(0).minStartingPrice()).isGreaterThanOrEqualTo(descPage.getContent().get(1).minStartingPrice());
    }

    @Test
    @DisplayName("Should provide autocomplete suggestions for chemical names and CAS")
    void testAutocompleteSuggestions() {
        List<SearchSuggestionResponse> suggestions = catalogSearchService.getSearchSuggestions("para", 5);
        assertThat(suggestions).isNotEmpty();
        assertThat(suggestions).anyMatch(s -> s.type().equals("PRODUCT") && s.title().contains("Paracetamol"));

        List<SearchSuggestionResponse> casSuggestions = catalogSearchService.getSearchSuggestions("103", 5);
        assertThat(casSuggestions).isNotEmpty();
        assertThat(casSuggestions).anyMatch(s -> s.type().equals("CAS") || s.type().equals("PRODUCT"));
    }

    @Test
    @DisplayName("Should return empty page when search term yields no results")
    void testEmptySearchResults() {
        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                "NonExistentChemicalX999", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "relevance", 0, 10
        );

        Page<SearchProductCardResponse> page = catalogSearchService.searchCatalog(criteria);
        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isZero();
    }
}
