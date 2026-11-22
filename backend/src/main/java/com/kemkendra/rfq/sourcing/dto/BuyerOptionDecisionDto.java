package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;

public record BuyerOptionDecisionDto(
        @NotBlank(message = "Decision is required (e.g. ACCEPTED or DECLINED)")
        String decision,

        String remarks
) {
}
