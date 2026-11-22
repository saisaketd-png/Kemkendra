package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProvideAdditionalInformationDto(
        @NotBlank(message = "Additional information or response is required")
        @Size(max = 2000)
        String additionalInfo,

        String attachmentReferences
) {
}
