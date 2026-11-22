package com.kemkendra.rfq.sourcing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingAssignmentDto(
        UUID id,
        UUID sourcingRequestId,
        UUID assignedToUserId,
        String assignedToUserName,
        UUID assignedByUserId,
        String assignedByUserName,
        String role,
        String notes,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
