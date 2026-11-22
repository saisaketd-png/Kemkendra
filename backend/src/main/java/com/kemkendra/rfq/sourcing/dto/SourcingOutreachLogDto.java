package com.kemkendra.rfq.sourcing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingOutreachLogDto(
        UUID id,
        UUID sourcingRequestId,
        UUID sourcingSupplierId,
        String supplierName,
        String outreachChannel,
        LocalDateTime contactDate,
        String contactPerson,
        UUID performedByUserId,
        String performedByUserName,
        String responseStatus,
        String subject,
        String details,
        String outcome,
        LocalDateTime nextFollowUpDate,
        String notes,
        LocalDateTime loggedAt
) {
    public SourcingOutreachLogDto(
            UUID id,
            UUID sourcingRequestId,
            UUID sourcingSupplierId,
            String supplierName,
            String outreachChannel,
            String contactPerson,
            UUID performedByUserId,
            String performedByUserName,
            String subject,
            String details,
            String outcome,
            LocalDateTime loggedAt
    ) {
        this(
                id,
                sourcingRequestId,
                sourcingSupplierId,
                supplierName,
                outreachChannel,
                loggedAt,
                contactPerson,
                performedByUserId,
                performedByUserName,
                "PENDING",
                subject,
                details,
                outcome,
                null,
                null,
                loggedAt
        );
    }
}
