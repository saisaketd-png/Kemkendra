package com.kemkendra.admin.analytics.dto;

import java.util.UUID;

public record ProductSummaryDto(
        UUID masterProductId,
        String masterProductCode,
        String name,
        String casNumber,
        String category
) {
}
