package com.kemkendra.dispute.dto;

import jakarta.validation.constraints.NotBlank;

public class ResolveDisputeRequest {

    @NotBlank(message = "Resolution notes are required")
    private String resolutionNotes;

    public ResolveDisputeRequest() {}

    public ResolveDisputeRequest(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
