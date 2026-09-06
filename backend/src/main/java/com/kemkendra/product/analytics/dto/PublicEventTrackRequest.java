package com.kemkendra.product.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PublicEventTrackRequest(
        @NotBlank(message = "Event type is required")
        @Size(max = 30, message = "Event type cannot exceed 30 characters")
        String eventType,

        @Size(max = 255, message = "Identifier cannot exceed 255 characters")
        String identifier,

        @Size(max = 100, message = "Category cannot exceed 100 characters")
        String category
) {
}
