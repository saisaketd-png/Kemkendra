package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductDemandDto(
        UUID masterProductId,
        String chemicalName,
        String casNumber,
        String category,
        long rfqCount,
        BigDecimal totalRequestedQuantity,
        String unit
) {
}
