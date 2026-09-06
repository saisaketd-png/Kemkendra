package com.kemkendra.admin.analytics.dto;

import java.util.UUID;

public record ProductCountDto(
        UUID masterProductId,
        String productName,
        String productCode,
        long count
) {
}
