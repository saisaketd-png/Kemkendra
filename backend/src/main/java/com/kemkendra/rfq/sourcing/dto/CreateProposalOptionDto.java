package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record CreateProposalOptionDto(
        UUID sourcingQuotationId,

        @NotBlank(message = "Option label is required (e.g. Option A - Recommended)")
        @Size(max = 100)
        String optionLabel,

        @NotBlank(message = "Supplier display name is required")
        @Size(max = 255)
        String supplierDisplayName,

        @NotBlank(message = "Product name is required")
        @Size(max = 255)
        String productName,

        String grade,

        String puritySpecifications,

        @NotNull(message = "Offered price per unit is required")
        @Positive(message = "Price must be positive")
        BigDecimal offeredPricePerUnit,

        String currency,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        BigDecimal quantity,

        @NotBlank(message = "Unit is required")
        String unit,

        BigDecimal moq,

        Integer leadTimeDays,

        String packaging,

        String deliveryTerms,

        String paymentTerms,

        LocalDateTime validUntil,

        String documentUrl,

        String recommendationNotes
) {
}
