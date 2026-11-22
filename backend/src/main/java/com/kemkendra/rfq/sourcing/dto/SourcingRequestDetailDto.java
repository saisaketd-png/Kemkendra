package com.kemkendra.rfq.sourcing.dto;

import com.kemkendra.rfq.sourcing.SourcingRequestStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SourcingRequestDetailDto(
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
        String specifications,
        String pharmacopeialStandard,
        BigDecimal quantity,
        String unit,
        String deliveryLocation,
        String packaging,
        BigDecimal targetPrice,
        String currency,
        LocalDate expectedDeliveryDate,
        String additionalRequirements,
        String attachmentReferences,
        SourcingRequestStatus status,
        UUID assignedToUserId,
        String assignedExecutiveName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<SourcingStatusHistoryDto> statusHistory,
        List<SourcingAssignmentDto> assignments,
        List<SourcingSupplierDto> suppliers,
        List<SourcingOutreachLogDto> outreachLogs,
        List<SourcingQuotationDto> quotations,
        List<SourcingProposalDto> proposals
) {
}
