package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateOutreachLogDto(
        UUID sourcingSupplierId, // optional or targeted to a specific identified supplier

        @NotBlank(message = "Contact method / channel is required (e.g. PHONE, EMAIL, OTHER)")
        @Size(max = 50, message = "Outreach channel cannot exceed 50 characters")
        String outreachChannel,

        LocalDateTime contactDate,

        @Size(max = 150, message = "Contact person cannot exceed 150 characters")
        String contactPerson,

        @Size(max = 50, message = "Response status cannot exceed 50 characters")
        String responseStatus, // PENDING, INTERESTED, NOT_INTERESTED, QUOTE_PROVIDED, NO_RESPONSE

        @Size(max = 255, message = "Subject cannot exceed 255 characters")
        String subject,

        @NotBlank(message = "Discussion details / log contents are required")
        String details,

        String outcome,

        LocalDateTime nextFollowUpDate,

        String notes
) {
}
