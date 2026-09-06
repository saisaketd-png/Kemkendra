package com.kemkendra.product.apis;

import com.kemkendra.product.CatalogSearchService;
import com.kemkendra.product.ProductCategory;
import com.kemkendra.product.dto.ProductSearchQueryCriteria;
import com.kemkendra.product.dto.SearchProductCardResponse;
import com.kemkendra.product.dto.SearchSuggestionResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public/search")
public class PublicSearchController {

    private final CatalogSearchService catalogSearchService;
    private final com.kemkendra.product.analytics.ProductAnalyticsEventService productAnalyticsEventService;

    public PublicSearchController(CatalogSearchService catalogSearchService,
                                  com.kemkendra.product.analytics.ProductAnalyticsEventService productAnalyticsEventService) {
        this.catalogSearchService = catalogSearchService;
        this.productAnalyticsEventService = productAnalyticsEventService;
    }

    /**
     * Advanced multi-field global chemical search with relevance ranking and filters.
     */
    @GetMapping
    public ResponseEntity<Page<SearchProductCardResponse>> search(
            @RequestParam(required = false, name = "q") String qParam,
            @RequestParam(required = false, name = "query") String queryParam,
            @RequestParam(required = false) ProductCategory category,
            @RequestParam(required = false) BigDecimal minPurity,
            @RequestParam(required = false) BigDecimal maxPurity,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) Boolean inStockOnly,
            @RequestParam(required = false) Boolean coaAvailable,
            @RequestParam(required = false) Boolean msdsAvailable,
            @RequestParam(required = false) Boolean exportReady,
            @RequestParam(required = false) Boolean recentlyAdded,
            @RequestParam(defaultValue = "relevance") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        String query = qParam != null && !qParam.isBlank() ? qParam : queryParam;

        if (query != null && !query.isBlank()) {
            productAnalyticsEventService.recordSearchEvent(query, category != null ? category.name() : null);
        }

        ProductSearchQueryCriteria criteria = new ProductSearchQueryCriteria(
                query,
                category,
                minPurity,
                maxPurity,
                minPrice,
                maxPrice,
                currency,
                supplierId,
                country,
                grade,
                verifiedOnly,
                inStockOnly,
                coaAvailable,
                msdsAvailable,
                exportReady,
                recentlyAdded,
                sort,
                page,
                size
        );

        return ResponseEntity.ok(catalogSearchService.searchCatalog(criteria));
    }

    /**
     * Autocomplete suggestions for chemical names, CAS numbers, codes, categories, and suppliers.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<SearchSuggestionResponse>> suggestions(
            @RequestParam(required = false, name = "q") String qParam,
            @RequestParam(required = false, name = "query") String queryParam,
            @RequestParam(defaultValue = "8") int limit) {

        String query = qParam != null && !qParam.isBlank() ? qParam : queryParam;
        return ResponseEntity.ok(catalogSearchService.getSearchSuggestions(query, limit));
    }
}
