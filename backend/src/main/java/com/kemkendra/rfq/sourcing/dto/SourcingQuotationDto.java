package com.kemkendra.rfq.sourcing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingQuotationDto(
        UUID id,
        UUID sourcingRequestId,
        UUID sourcingSupplierId,
        String supplierName,
        String quotationReference,
        String productName,
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
        Boolean shareWithBuyer,
        BigDecimal totalLandedCostPerUnit,
        BigDecimal totalEstimatedCost,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public SourcingQuotationDto(
            UUID id,
            UUID sourcingRequestId,
            UUID sourcingSupplierId,
            String supplierName,
            String quotationReference,
            BigDecimal unitPrice,
            String currency,
            BigDecimal minimumOrderQuantity,
            Integer leadTimeDays,
            String paymentTerms,
            String incoterms,
            LocalDateTime validUntil,
            String notes,
            String attachmentUrl,
            String status,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(
                id,
                sourcingRequestId,
                sourcingSupplierId,
                supplierName,
                quotationReference,
                null,
                unitPrice,
                currency,
                null,
                minimumOrderQuantity,
                null,
                null,
                null,
                null,
                leadTimeDays,
                BigDecimal.ZERO,
                paymentTerms,
                incoterms,
                validUntil,
                notes,
                attachmentUrl,
                null,
                status,
                false,
                unitPrice,
                null,
                createdAt,
                updatedAt
        );
    }
}
