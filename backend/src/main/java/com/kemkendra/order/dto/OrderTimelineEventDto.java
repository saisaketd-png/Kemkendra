package com.kemkendra.order.dto;

import java.time.LocalDateTime;

public record OrderTimelineEventDto(
        String step,
        String title,
        String description,
        String actorRole,
        String actorName,
        LocalDateTime timestamp,
        boolean completed,
        boolean current
) {}
