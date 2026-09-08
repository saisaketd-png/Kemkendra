package com.kemkendra.dispute.dto;

import com.kemkendra.dispute.DisputeStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateDisputeStatusRequest {

    @NotNull(message = "Dispute status is required")
    private DisputeStatus status;

    private String notes;

    public UpdateDisputeStatusRequest() {}

    public UpdateDisputeStatusRequest(DisputeStatus status, String notes) {
        this.status = status;
        this.notes = notes;
    }

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
