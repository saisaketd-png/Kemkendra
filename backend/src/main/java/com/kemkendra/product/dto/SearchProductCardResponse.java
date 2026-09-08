package com.kemkendra.product.dto;

import com.kemkendra.product.ProductCategory;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record SearchProductCardResponse(
        UUID id,
        String masterProductCode,
        String name,
        String casNumber,
        String molecularFormula,
        ProductCategory category,
        String description,
        String status,
        String primaryImageUrl,
        BigDecimal minStartingPrice,
        String currency,
        BigDecimal minPurity,
        BigDecimal maxPurity,
        String grade,
        int offeringCount,
        int verifiedSupplierCount,
        List<String> supplierNames,
        List<String> countries,
        boolean coaAvailable,
        boolean msdsAvailable,
        boolean exportReady,
        String availabilityStatus,
        int relevanceScore
) {}
