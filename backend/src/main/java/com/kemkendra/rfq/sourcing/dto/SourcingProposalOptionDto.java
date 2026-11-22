package com.kemkendra.rfq.sourcing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingProposalOptionDto(
        UUID id,
        UUID sourcingProposalId,
        UUID sourcingQuotationId,
        String optionLabel,
        String supplierDisplayName,
        String productName,
        String grade,
        String puritySpecifications,
        BigDecimal offeredPricePerUnit,
        String currency,
        BigDecimal quantity,
        String unit,
        BigDecimal moq,
        Integer leadTimeDays,
        String packaging,
        String deliveryTerms,
        String paymentTerms,
        LocalDateTime validUntil,
        String documentUrl,
        String recommendationNotes,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
