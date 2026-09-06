package com.kemkendra.admin.analytics.dto;

public record CategoryActivityDto(
        String category,
        long rfqCount,
        long orderCount,
        long offeringCount
) {
}
