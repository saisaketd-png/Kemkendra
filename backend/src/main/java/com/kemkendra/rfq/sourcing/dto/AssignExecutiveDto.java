package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record AssignExecutiveDto(
        @NotNull(message = "Assigned user ID is required")
        UUID assignedToUserId,

        String role,
        String notes
) {
}
