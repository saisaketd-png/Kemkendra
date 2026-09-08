package com.kemkendra.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectPaymentRequest {

    @NotBlank(message = "Rejection reason is required")
    private String rejectionReason;

    public RejectPaymentRequest() {}

    public RejectPaymentRequest(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
