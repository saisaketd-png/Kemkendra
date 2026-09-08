package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;

public record TopSupplierDto(
        Long supplierId,
        String supplierName,
        long orderCount,
        long completedCount,
        BigDecimal totalGmv
) {
}
