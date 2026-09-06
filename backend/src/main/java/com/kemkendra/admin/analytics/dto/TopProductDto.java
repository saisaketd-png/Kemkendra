package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductDto(
        UUID masterProductId,
        String productCode,
        String productName,
        long orderCount,
        BigDecimal totalQuantity,
        BigDecimal totalAmount,
        String unit
) {
}
