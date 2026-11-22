package com.kemkendra.rfq.sourcing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public record SourcingProposalDto(
        UUID id,
        UUID sourcingRequestId,
        String proposalReference,
        String title,
        BigDecimal offeredPricePerUnit,
        String currency,
        BigDecimal quantity,
        String unit,
        Integer estimatedDeliveryDays,
        String termsAndConditions,
        String summaryNotes,
        String recommendationNotes,
        String proposalDocumentUrl,
        String status,
        UUID selectedOptionId,
        String buyerFeedback,
        LocalDateTime sentToBuyerAt,
        LocalDateTime buyerDecisionAt,
        List<SourcingProposalOptionDto> options,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public SourcingProposalDto(
            UUID id,
            UUID sourcingRequestId,
            String proposalReference,
            String title,
            BigDecimal offeredPricePerUnit,
            String currency,
            BigDecimal quantity,
            String unit,
            Integer estimatedDeliveryDays,
            String termsAndConditions,
            String proposalDocumentUrl,
            String status,
            LocalDateTime sentToBuyerAt,
            LocalDateTime buyerDecisionAt,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(
                id,
                sourcingRequestId,
                proposalReference,
                title,
                offeredPricePerUnit,
                currency,
                quantity,
                unit,
                estimatedDeliveryDays,
                termsAndConditions,
                null,
                null,
                proposalDocumentUrl,
                status,
                null,
                null,
                sentToBuyerAt,
                buyerDecisionAt,
                Collections.emptyList(),
                createdAt,
                updatedAt
        );
    }
}
