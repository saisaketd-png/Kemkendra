package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BuyerClarificationRequestDto(
        @NotBlank(message = "Question or clarification inquiry is required")
        @Size(max = 2000)
        String question,

        String subject
) {
}
