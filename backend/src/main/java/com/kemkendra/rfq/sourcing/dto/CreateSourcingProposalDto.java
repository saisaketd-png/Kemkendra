package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateSourcingProposalDto(
        @NotBlank(message = "Proposal title is required")
        @Size(max = 255)
        String title,

        String summaryNotes,

        String recommendationNotes,

        String termsAndConditions,

        String proposalDocumentUrl,

        @NotEmpty(message = "At least one proposal option must be configured")
        @Valid
        List<CreateProposalOptionDto> options,

        boolean publishImmediately
) {
}
