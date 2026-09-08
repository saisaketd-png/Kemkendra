package com.kemkendra.dashboard.dto;

import java.time.LocalDateTime;

public record DashboardActivityItemDto(
        String id,
        String activityType,
        String title,
        String description,
        String entityType,
        String entityId,
        String referenceCode,
        String status,
        LocalDateTime timestamp,
        String targetUrl
) {}
