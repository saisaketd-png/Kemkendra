package com.kemkendra.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public class DisputePaymentRequest {
    @NotBlank(message = "Dispute reason is required")
    private String disputeReason;

    public DisputePaymentRequest() {}
    public DisputePaymentRequest(String disputeReason) { this.disputeReason = disputeReason; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
}
