package com.kemkendra.admin.analytics.dto;

import java.util.UUID;

public record ProductDemandGrowthDto(
        UUID masterProductId,
        String productName,
        String casNumber,
        long currentPeriodRfqCount,
        long previousPeriodRfqCount,
        double growthPercentage
) {
}
