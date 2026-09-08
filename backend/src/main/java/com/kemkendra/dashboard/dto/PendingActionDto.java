package com.kemkendra.dashboard.dto;

public record PendingActionDto(
        String id,
        String actionType,
        String title,
        String description,
        int count,
        String severity,
        String targetUrl,
        String ctaText
) {}
