package com.kemkendra.product.dto;

import com.kemkendra.product.ProductCategory;

import java.math.BigDecimal;
import java.util.UUID;

public record SupplierProductPublicResponse(
        UUID id,
        String masterProductCode,
        String name,
        String description,
        ProductCategory category,
        String casNumber,
        String molecularFormula,
        String imageUrl,
        BigDecimal purity,
        String grade,
        BigDecimal moqKg,
        String packaging,
        Integer leadTimeDays,
        String availabilityStatus,
        Boolean exportReady,
        BigDecimal price,
        String currency
) {}
