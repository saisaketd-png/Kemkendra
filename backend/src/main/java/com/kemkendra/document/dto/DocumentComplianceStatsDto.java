package com.kemkendra.document.dto;

public record DocumentComplianceStatsDto(
        long pendingReviewCount,
        long approvedCount,
        long rejectedCount,
        long expiredCount,
        long expiringSoonCount,
        long totalCount
) {}
