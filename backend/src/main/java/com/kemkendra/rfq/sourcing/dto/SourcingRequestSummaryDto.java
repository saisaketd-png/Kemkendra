package com.kemkendra.rfq.sourcing.dto;

import com.kemkendra.rfq.sourcing.SourcingRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingRequestSummaryDto(
        UUID id,
        String sourcingRequestReference,
        UUID buyerId,
        String buyerName,
        String buyerEmail,
        String buyerPhone,
        String buyerCompany,
        String productName,
        String casNumber,
        String category,
        String grade,
        BigDecimal quantity,
        String unit,
        String deliveryLocation,
        BigDecimal targetPrice,
        String currency,
        LocalDate expectedDeliveryDate,
        SourcingRequestStatus status,
        UUID assignedToUserId,
        String assignedExecutiveName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
