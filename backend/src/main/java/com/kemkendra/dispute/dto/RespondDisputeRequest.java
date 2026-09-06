package com.kemkendra.dispute.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;

public class RespondDisputeRequest {

    @NotBlank(message = "Response message is required")
    private String message;

    private List<UUID> attachmentDocumentIds;

    public RespondDisputeRequest() {
    }

    public RespondDisputeRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<UUID> getAttachmentDocumentIds() {
        return attachmentDocumentIds;
    }

    public void setAttachmentDocumentIds(List<UUID> attachmentDocumentIds) {
        this.attachmentDocumentIds = attachmentDocumentIds;
    }
}
