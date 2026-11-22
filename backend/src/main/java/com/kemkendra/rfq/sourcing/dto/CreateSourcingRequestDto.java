package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateSourcingRequestDto(
        @NotBlank(message = "Product name is required")
        String productName,

        @NotBlank(message = "Product category is required")
        String category,

        @NotNull(message = "Required quantity is required")
        @DecimalMin(value = "0.01", message = "Quantity must be greater than zero")
        BigDecimal quantity,

        @NotBlank(message = "Unit of measurement is required")
        String unit,

        @NotBlank(message = "Delivery location is required")
        String deliveryLocation,

        String casNumber,
        String grade,
        String specifications,
        String pharmacopeialStandard,
        String packaging,

        @DecimalMin(value = "0.00", inclusive = false, message = "Target price must be positive")
        BigDecimal targetPrice,

        String currency,
        LocalDate expectedDeliveryDate,
        String additionalRequirements,
        String attachmentReferences
) {
}
