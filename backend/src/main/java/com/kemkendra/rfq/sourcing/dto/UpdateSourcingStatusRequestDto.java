package com.kemkendra.rfq.sourcing.dto;

import com.kemkendra.rfq.sourcing.SourcingRequestStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateSourcingStatusRequestDto(
        @NotNull(message = "Status is required")
        SourcingRequestStatus status,

        String reasonOrNotes
) {
}
