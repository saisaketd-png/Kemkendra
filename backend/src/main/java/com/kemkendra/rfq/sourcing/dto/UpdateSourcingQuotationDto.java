package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record UpdateSourcingQuotationDto(
        UUID sourcingSupplierId,

        @NotBlank(message = "Product name is required")
        @Size(max = 255)
        String productName,

        @NotNull(message = "Unit price is required")
        @Positive(message = "Unit price must be positive")
        BigDecimal unitPrice,

        String currency,

        String unit,

        BigDecimal minimumOrderQuantity,

        BigDecimal availableQuantity,

        String productGrade,

        String puritySpecifications,

        String packaging,

        Integer leadTimeDays,

        BigDecimal deliveryCharges,

        String paymentTerms,

        String incoterms,

        LocalDateTime validUntil,

        String notes,

        String attachmentUrl,

        String supportingDocuments,

        String status,

        Boolean shareWithBuyer
) {
}
