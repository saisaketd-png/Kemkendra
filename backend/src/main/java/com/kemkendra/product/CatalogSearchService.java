package com.kemkendra.product;

import com.kemkendra.identity.UserStatus;
import com.kemkendra.product.dto.ProductSearchQueryCriteria;
import com.kemkendra.product.dto.SearchProductCardResponse;
import com.kemkendra.product.dto.SearchSuggestionResponse;
import com.kemkendra.seller.SupplierVerificationStatus;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CatalogSearchService {

    private final EntityManager entityManager;
    private final SupplierOfferingRepository supplierOfferingRepository;
    private final MasterProductImageRepository masterProductImageRepository;
    private final SupplierRepository supplierRepository;

    public CatalogSearchService(
            EntityManager entityManager,
            SupplierOfferingRepository supplierOfferingRepository,
            MasterProductImageRepository masterProductImageRepository,
            SupplierRepository supplierRepository) {
        this.entityManager = entityManager;
        this.supplierOfferingRepository = supplierOfferingRepository;
        this.masterProductImageRepository = masterProductImageRepository;
        this.supplierRepository = supplierRepository;
    }

    /**
     * Executes global search and filtering across the active Master Product catalog with relevance ranking.
     */
    public Page<SearchProductCardResponse> searchCatalog(ProductSearchQueryCriteria criteria) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // 1. COUNT QUERY FOR PAGINATION
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<MasterProduct> countRoot = countQuery.from(MasterProduct.class);
        Predicate countPredicate = buildPredicates(cb, countRoot, criteria, countQuery);
        countQuery.select(cb.countDistinct(countRoot)).where(countPredicate);
        Long totalElements = entityManager.createQuery(countQuery).getSingleResult();

        if (totalElements == 0) {
            return new PageImpl<>(List.of(), PageRequest.of(criteria.page(), criteria.size()), 0);
        }

        // 2. DATA QUERY
        CriteriaQuery<MasterProduct> dataQuery = cb.createQuery(MasterProduct.class);
        Root<MasterProduct> dataRoot = dataQuery.from(MasterProduct.class);
        Predicate dataPredicate = buildPredicates(cb, dataRoot, criteria, dataQuery);
        dataQuery.select(dataRoot).distinct(true).where(dataPredicate);

        // Sorting
        applySorting(cb, dataRoot, criteria, dataQuery);

        TypedQuery<MasterProduct> query = entityManager.createQuery(dataQuery);
        query.setFirstResult(criteria.page() * criteria.size());
        query.setMaxResults(criteria.size());

        List<MasterProduct> masterProducts = query.getResultList();
        if (masterProducts.isEmpty()) {
            return new PageImpl<>(List.of(), PageRequest.of(criteria.page(), criteria.size()), totalElements);
        }

        // 3. BATCH LOAD OFFERINGS & IMAGES (Zero N+1)
        List<UUID> productIds = masterProducts.stream().map(MasterProduct::getId).toList();
        List<SupplierOffering> allOfferings = supplierOfferingRepository.findByMasterProductIdIn(productIds);
        List<MasterProductImage> allImages = masterProductImageRepository.findByMasterProductIdInAndStatus(productIds, "ACTIVE");

        Map<UUID, List<SupplierOffering>> offeringsByProduct = allOfferings.stream()
                .filter(this::isOfferingPubliclyVisible)
                .collect(Collectors.groupingBy(o -> o.getMasterProduct().getId()));

        Map<UUID, List<MasterProductImage>> imagesByProduct = allImages.stream()
                .collect(Collectors.groupingBy(i -> i.getMasterProduct().getId()));

        // 4. TRANSFORM TO RICH SEARCH PRODUCT CARDS
        List<SearchProductCardResponse> cardResponses = masterProducts.stream().map(mp -> {
            List<SupplierOffering> offerings = offeringsByProduct.getOrDefault(mp.getId(), List.of());
            List<MasterProductImage> images = imagesByProduct.getOrDefault(mp.getId(), List.of());

            // Primary Image resolution
            String primaryImageUrl = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .map(img -> "/api/v1/master-products/" + mp.getId() + "/images/" + img.getId() + "/content")
                    .orElseGet(() -> images.stream()
                            .min(Comparator.comparingInt(MasterProductImage::getDisplayOrder))
                            .map(img -> "/api/v1/master-products/" + mp.getId() + "/images/" + img.getId() + "/content")
                            .orElse(null));

            // Aggregations across active approved offerings
            BigDecimal minPrice = null;
            String currency = "INR";
            BigDecimal minPurity = null;
            BigDecimal maxPurity = null;
            String bestGrade = null;
            boolean coa = false;
            boolean msds = false;
            boolean export = false;

            Set<String> supplierNames = new LinkedHashSet<>();
            Set<String> countries = new LinkedHashSet<>();
            int verifiedSupplierCount = 0;

            for (SupplierOffering off : offerings) {
                if (off.getPrice() != null && off.getPrice().compareTo(BigDecimal.ZERO) > 0) {
                    if (minPrice == null || off.getPrice().compareTo(minPrice) < 0) {
                        minPrice = off.getPrice();
                        if (off.getCurrency() != null) currency = off.getCurrency();
                    }
                }
                if (off.getPurity() != null) {
                    if (minPurity == null || off.getPurity().compareTo(minPurity) < 0) minPurity = off.getPurity();
                    if (maxPurity == null || off.getPurity().compareTo(maxPurity) > 0) maxPurity = off.getPurity();
                }
                if (bestGrade == null && off.getGrade() != null && !off.getGrade().isBlank()) {
                    bestGrade = off.getGrade();
                }
                if (Boolean.TRUE.equals(off.getCoaAvailable())) coa = true;
                if (Boolean.TRUE.equals(off.getMsdsAvailable())) msds = true;
                if (Boolean.TRUE.equals(off.getExportReady())) export = true;

                if (off.getSupplier() != null) {
                    Supplier s = off.getSupplier();
                    if (s.getName() != null) supplierNames.add(s.getName());
                    if (s.getCountryName() != null) countries.add(s.getCountryName());
                    if (Boolean.TRUE.equals(s.getVerified())) verifiedSupplierCount++;
                }
            }

            int relevanceScore = calculateRelevanceScore(mp, offerings, criteria.query());

            return new SearchProductCardResponse(
                    mp.getId(),
                    mp.getMasterProductCode(),
                    mp.getName(),
                    mp.getCasNumber(),
                    mp.getMolecularFormula(),
                    mp.getCategory(),
                    mp.getDescription(),
                    mp.getStatus(),
                    primaryImageUrl,
                    minPrice,
                    currency,
                    minPurity,
                    maxPurity,
                    bestGrade,
                    offerings.size(),
                    verifiedSupplierCount,
                    new ArrayList<>(supplierNames),
                    new ArrayList<>(countries),
                    coa,
                    msds,
                    export,
                    !offerings.isEmpty() ? "AVAILABLE" : "ONBOARDING",
                    relevanceScore
            );
        }).collect(Collectors.toCollection(ArrayList::new));

        // In-memory final refinement for sorting by relevance or computed price/purity if requested
        if ("relevance".equalsIgnoreCase(criteria.sort()) && criteria.query() != null && !criteria.query().isBlank()) {
            cardResponses.sort(Comparator.comparingInt(SearchProductCardResponse::relevanceScore).reversed()
                    .thenComparing(SearchProductCardResponse::offeringCount, Comparator.reverseOrder()));
        } else if ("price_asc".equalsIgnoreCase(criteria.sort())) {
            cardResponses.sort(Comparator.comparing(SearchProductCardResponse::minStartingPrice, Comparator.nullsLast(BigDecimal::compareTo)));
        } else if ("price_desc".equalsIgnoreCase(criteria.sort())) {
            cardResponses.sort(Comparator.comparing(SearchProductCardResponse::minStartingPrice, Comparator.nullsLast(Comparator.reverseOrder())));
        } else if ("purity_desc".equalsIgnoreCase(criteria.sort())) {
            cardResponses.sort(Comparator.comparing(SearchProductCardResponse::maxPurity, Comparator.nullsLast(Comparator.reverseOrder())));
        }

        return new PageImpl<>(cardResponses, PageRequest.of(criteria.page(), criteria.size()), totalElements);
    }

    /**
     * Autocomplete suggestions for instant debounced search dropdowns.
     */
    public List<SearchSuggestionResponse> getSearchSuggestions(String rawQuery, int limit) {
        if (rawQuery == null || rawQuery.trim().length() < 2) {
            return List.of();
        }
        int maxResults = Math.min(Math.max(limit, 1), 20);
        String query = rawQuery.trim().toLowerCase();
        List<SearchSuggestionResponse> suggestions = new ArrayList<>();

        // 1. Direct CAS Suggestion if numbers or hyphens are entered
        String cleanedDigits = query.replaceAll("[^0-9]", "");
        if (cleanedDigits.length() >= 3) {
            TypedQuery<MasterProduct> casQuery = entityManager.createQuery(
                    "SELECT mp FROM MasterProduct mp WHERE mp.status = 'ACTIVE' AND mp.deactivatedAt IS NULL AND " +
                            "(LOWER(mp.casNumber) LIKE :q OR REPLACE(REPLACE(mp.casNumber, '-', ''), ' ', '') LIKE :digits) ORDER BY mp.name ASC",
                    MasterProduct.class);
            casQuery.setParameter("q", "%" + query + "%");
            casQuery.setParameter("digits", "%" + cleanedDigits + "%");
            casQuery.setMaxResults(3);
            for (MasterProduct mp : casQuery.getResultList()) {
                suggestions.add(new SearchSuggestionResponse(
                        "CAS",
                        mp.getCasNumber(),
                        mp.getName() + " (" + mp.getCategory() + ")",
                        "/search?q=" + mp.getCasNumber(),
                        "CAS",
                        "CAS Registry"
                ));
            }
        }

        // 2. Chemical Products (by Name, Code, or Approved Synonym)
        TypedQuery<MasterProduct> prodQuery = entityManager.createQuery(
                "SELECT DISTINCT mp FROM MasterProduct mp LEFT JOIN mp.synonyms s " +
                        "WHERE mp.status = 'ACTIVE' AND mp.deactivatedAt IS NULL AND (" +
                        "LOWER(mp.name) LIKE :q OR LOWER(mp.masterProductCode) LIKE :q OR " +
                        "(s.status = com.kemkendra.product.SynonymStatus.APPROVED AND LOWER(s.synonym) LIKE :q)) " +
                        "ORDER BY mp.name ASC", MasterProduct.class);
        prodQuery.setParameter("q", "%" + query + "%");
        prodQuery.setMaxResults(6);
        for (MasterProduct mp : prodQuery.getResultList()) {
            suggestions.add(new SearchSuggestionResponse(
                    "PRODUCT",
                    mp.getName(),
                    "CAS: " + (mp.getCasNumber() != null ? mp.getCasNumber() : "N/A") + " • " + mp.getCategory(),
                    "/products/" + mp.getMasterProductCode(),
                    "NAME",
                    mp.getCategory().name()
            ));
        }

        // 3. Category match
        for (ProductCategory cat : ProductCategory.values()) {
            if (cat.name().toLowerCase().contains(query) || cat.name().replace("_", " ").toLowerCase().contains(query)) {
                suggestions.add(new SearchSuggestionResponse(
                        "CATEGORY",
                        cat.name().replace("_", " "),
                        "Browse chemical category",
                        "/search?category=" + cat.name(),
                        "CATEGORY",
                        "Category"
                ));
                if (suggestions.size() >= maxResults) break;
            }
        }

        // 4. Verified Supplier match
        if (suggestions.size() < maxResults) {
            TypedQuery<Supplier> suppQuery = entityManager.createQuery(
                    "SELECT s FROM Supplier s WHERE s.verified = true AND s.verificationStatus = com.kemkendra.seller.SupplierVerificationStatus.VERIFIED " +
                            "AND (s.user IS NULL OR (s.user.status = com.kemkendra.identity.UserStatus.ACTIVE AND s.user.deletedAt IS NULL)) " +
                            "AND LOWER(s.name) LIKE :q ORDER BY s.name ASC", Supplier.class);
            suppQuery.setParameter("q", "%" + query + "%");
            suppQuery.setMaxResults(3);
            for (Supplier s : suppQuery.getResultList()) {
                suggestions.add(new SearchSuggestionResponse(
                        "SUPPLIER",
                        s.getName(),
                        "Verified Chemical Supplier • " + (s.getCountryName() != null ? s.getCountryName() : "Global"),
                        "/suppliers/" + s.getId(),
                        "SUPPLIER",
                        "Verified Supplier"
                ));
            }
        }

        // Deduplicate and limit
        Map<String, SearchSuggestionResponse> dedup = new LinkedHashMap<>();
        for (SearchSuggestionResponse s : suggestions) {
            dedup.putIfAbsent(s.type() + ":" + s.title(), s);
            if (dedup.size() >= maxResults) break;
        }

        return new ArrayList<>(dedup.values());
    }

    private Predicate buildPredicates(CriteriaBuilder cb, Root<MasterProduct> root, ProductSearchQueryCriteria criteria, CriteriaQuery<?> cq) {
        List<Predicate> predicates = new ArrayList<>();

        // Exclude deleted / deactivated products
        predicates.add(cb.equal(cb.upper(root.get("status")), "ACTIVE"));
        predicates.add(cb.isNull(root.get("deactivatedAt")));

        // 1. Global Multi-Field Search (Chemical Name, CAS, Code, Synonyms, Supplier Name, Description)
        if (criteria.query() != null && !criteria.query().isBlank()) {
            String rawQuery = criteria.query().trim();
            String lq = "%" + rawQuery.toLowerCase() + "%";
            List<Predicate> searchOr = new ArrayList<>();

            // Chemical Name
            searchOr.add(cb.like(cb.lower(root.get("name")), lq));

            // Product Code
            searchOr.add(cb.like(cb.lower(root.get("masterProductCode")), lq));

            // CAS Number (raw and stripped)
            searchOr.add(cb.like(cb.lower(root.get("casNumber")), lq));
            String digits = rawQuery.replaceAll("[^0-9]", "");
            if (digits.length() >= 3) {
                Expression<String> strippedCas = cb.function("REPLACE", String.class,
                        cb.function("REPLACE", String.class, root.get("casNumber"), cb.literal("-"), cb.literal("")),
                        cb.literal(" "), cb.literal(""));
                searchOr.add(cb.like(strippedCas, "%" + digits + "%"));
            }

            // Molecular Formula
            searchOr.add(cb.like(cb.lower(root.get("molecularFormula")), lq));

            // Description
            searchOr.add(cb.like(cb.lower(root.get("description")), lq));

            // Approved Synonyms (Preserves commas, avoids inactive)
            Join<MasterProduct, ProductSynonym> synonymJoin = root.join("synonyms", JoinType.LEFT);
            searchOr.add(cb.and(
                    cb.equal(synonymJoin.get("status"), SynonymStatus.APPROVED),
                    cb.like(cb.lower(synonymJoin.get("synonym")), lq)
            ));

            // Supplier Name Match
            Join<MasterProduct, SupplierOffering> offeringJoin = root.join("offerings", JoinType.LEFT);
            Join<SupplierOffering, Supplier> supplierJoin = offeringJoin.join("supplier", JoinType.LEFT);
            searchOr.add(cb.and(
                    cb.equal(cb.upper(offeringJoin.get("availabilityStatus")), "AVAILABLE"),
                    cb.equal(cb.upper(offeringJoin.get("moderationStatus")), "APPROVED"),
                    cb.like(cb.lower(supplierJoin.get("name")), lq)
            ));

            predicates.add(cb.or(searchOr.toArray(new Predicate[0])));
        }

        // 2. Category Filter
        if (criteria.category() != null) {
            predicates.add(cb.equal(root.get("category"), criteria.category()));
        }

        // 3. Recently Added (last 60 days)
        if (Boolean.TRUE.equals(criteria.recentlyAdded())) {
            LocalDateTime sixtyDaysAgo = LocalDateTime.now().minusDays(60);
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), sixtyDaysAgo));
        }

        // 4. Offering & Supplier Specific Filters
        boolean hasOfferingFilter = criteria.minPurity() != null || criteria.maxPurity() != null
                || criteria.minPrice() != null || criteria.maxPrice() != null
                || criteria.supplierId() != null || criteria.country() != null
                || criteria.grade() != null || Boolean.TRUE.equals(criteria.inStockOnly())
                || Boolean.TRUE.equals(criteria.coaAvailable()) || Boolean.TRUE.equals(criteria.msdsAvailable())
                || Boolean.TRUE.equals(criteria.exportReady()) || Boolean.TRUE.equals(criteria.verifiedOnly());

        if (hasOfferingFilter) {
            Join<MasterProduct, SupplierOffering> offJoin = root.join("offerings", JoinType.INNER);
            Join<SupplierOffering, Supplier> suppJoin = offJoin.join("supplier", JoinType.INNER);

            predicates.add(cb.equal(cb.upper(offJoin.get("availabilityStatus")), "AVAILABLE"));
            predicates.add(cb.equal(cb.upper(offJoin.get("moderationStatus")), "APPROVED"));

            // Exclude suspended / deleted suppliers
            predicates.add(cb.isTrue(suppJoin.get("verified")));
            predicates.add(cb.notEqual(suppJoin.get("verificationStatus"), SupplierVerificationStatus.SUSPENDED));
            predicates.add(cb.notEqual(suppJoin.get("verificationStatus"), SupplierVerificationStatus.REJECTED));

            if (criteria.minPurity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(offJoin.get("purity"), criteria.minPurity()));
            }
            if (criteria.maxPurity() != null) {
                predicates.add(cb.lessThanOrEqualTo(offJoin.get("purity"), criteria.maxPurity()));
            }
            if (criteria.minPrice() != null && criteria.minPrice().compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.greaterThanOrEqualTo(offJoin.get("price"), criteria.minPrice()));
            }
            if (criteria.maxPrice() != null && criteria.maxPrice().compareTo(BigDecimal.ZERO) > 0) {
                predicates.add(cb.lessThanOrEqualTo(offJoin.get("price"), criteria.maxPrice()));
            }
            if (criteria.currency() != null && !criteria.currency().isBlank()) {
                predicates.add(cb.equal(cb.upper(offJoin.get("currency")), criteria.currency().trim().toUpperCase()));
            }
            if (criteria.supplierId() != null) {
                predicates.add(cb.equal(suppJoin.get("id"), criteria.supplierId()));
            }
            if (criteria.country() != null && !criteria.country().isBlank()) {
                predicates.add(cb.like(cb.lower(suppJoin.get("countryName")), "%" + criteria.country().trim().toLowerCase() + "%"));
            }
            if (criteria.grade() != null && !criteria.grade().isBlank()) {
                predicates.add(cb.like(cb.lower(offJoin.get("grade")), "%" + criteria.grade().trim().toLowerCase() + "%"));
            }
            if (Boolean.TRUE.equals(criteria.inStockOnly())) {
                predicates.add(cb.greaterThan(offJoin.get("stock"), 0));
            }
            if (Boolean.TRUE.equals(criteria.coaAvailable())) {
                predicates.add(cb.isTrue(offJoin.get("coaAvailable")));
            }
            if (Boolean.TRUE.equals(criteria.msdsAvailable())) {
                predicates.add(cb.isTrue(offJoin.get("msdsAvailable")));
            }
            if (Boolean.TRUE.equals(criteria.exportReady())) {
                predicates.add(cb.isTrue(offJoin.get("exportReady")));
            }
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    }

    private void applySorting(CriteriaBuilder cb, Root<MasterProduct> root, ProductSearchQueryCriteria criteria, CriteriaQuery<?> query) {
        String sort = criteria.sort() != null ? criteria.sort().trim().toLowerCase() : "relevance";
        switch (sort) {
            case "newest":
                query.orderBy(cb.desc(root.get("createdAt")));
                break;
            case "supplier_name":
                query.orderBy(cb.asc(root.get("name")));
                break;
            default:
                // For relevance or unspecific, default to createdAt DESC at DB level; in-memory scoring refines page
                query.orderBy(cb.desc(root.get("createdAt")));
                break;
        }
    }

    private boolean isOfferingPubliclyVisible(SupplierOffering offering) {
        if (!"AVAILABLE".equalsIgnoreCase(offering.getAvailabilityStatus())) return false;
        if (!"APPROVED".equalsIgnoreCase(offering.getModerationStatus())) return false;
        Supplier s = offering.getSupplier();
        if (s == null) return false;
        if (!Boolean.TRUE.equals(s.getVerified())) return false;
        if (s.getVerificationStatus() == SupplierVerificationStatus.SUSPENDED) return false;
        if (s.getVerificationStatus() == SupplierVerificationStatus.REJECTED) return false;
        if (s.getUser() != null) {
            if (s.getUser().getDeletedAt() != null) return false;
            if (s.getUser().getStatus() == UserStatus.SUSPENDED) return false;
        }
        return true;
    }

    private int calculateRelevanceScore(MasterProduct mp, List<SupplierOffering> offerings, String query) {
        if (query == null || query.isBlank()) {
            return 50;
        }
        String q = query.trim().toLowerCase();
        String name = mp.getName() != null ? mp.getName().toLowerCase() : "";
        String code = mp.getMasterProductCode() != null ? mp.getMasterProductCode().toLowerCase() : "";
        String cas = mp.getCasNumber() != null ? mp.getCasNumber().toLowerCase() : "";
        String digits = q.replaceAll("[^0-9]", "");
        String strippedCas = cas.replaceAll("[^0-9]", "");

        // 1. Exact CAS or Code match
        if (cas.equals(q) || (!digits.isEmpty() && strippedCas.equals(digits)) || code.equals(q)) {
            return 100;
        }
        // 2. Exact Name match
        if (name.equals(q)) {
            return 90;
        }
        // 3. Name prefix match
        if (name.startsWith(q)) {
            return 80;
        }
        // 4. Approved Synonyms match
        if (mp.getSynonyms() != null) {
            for (ProductSynonym syn : mp.getSynonyms()) {
                if (syn.getStatus() == SynonymStatus.APPROVED && syn.getSynonym() != null) {
                    String s = syn.getSynonym().toLowerCase();
                    if (s.equals(q)) return 75;
                    if (s.startsWith(q)) return 70;
                    if (s.contains(q)) return 55;
                }
            }
        }
        // 5. Name contains substring
        if (name.contains(q)) {
            return 65;
        }
        // 6. Supplier name match
        for (SupplierOffering off : offerings) {
            if (off.getSupplier() != null && off.getSupplier().getName() != null) {
                if (off.getSupplier().getName().toLowerCase().contains(q)) {
                    return 45;
                }
            }
        }
        // 7. Formula / Description
        if (mp.getMolecularFormula() != null && mp.getMolecularFormula().toLowerCase().contains(q)) {
            return 35;
        }
        if (mp.getDescription() != null && mp.getDescription().toLowerCase().contains(q)) {
            return 30;
        }
        return 20;
    }
}
