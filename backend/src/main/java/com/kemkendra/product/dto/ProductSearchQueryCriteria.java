package com.kemkendra.product.dto;

import com.kemkendra.product.ProductCategory;

import java.math.BigDecimal;

public record ProductSearchQueryCriteria(
        String query,
        ProductCategory category,
        BigDecimal minPurity,
        BigDecimal maxPurity,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String currency,
        Long supplierId,
        String country,
        String grade,
        Boolean verifiedOnly,
        Boolean inStockOnly,
        Boolean coaAvailable,
        Boolean msdsAvailable,
        Boolean exportReady,
        Boolean recentlyAdded,
        String sort,
        int page,
        int size
) {
    public ProductSearchQueryCriteria {
        if (page < 0) page = 0;
        if (size <= 0) size = 20;
        if (size > 100) size = 100;
        if (sort == null || sort.isBlank()) sort = "relevance";
    }
}
