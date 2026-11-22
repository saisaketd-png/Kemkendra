package com.kemkendra.rfq.sourcing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingStatusHistoryDto(
        UUID id,
        UUID sourcingRequestId,
        String previousStatus,
        String newStatus,
        UUID changedByUserId,
        String changedByUserName,
        String reasonOrNotes,
        LocalDateTime createdAt
) {
}
