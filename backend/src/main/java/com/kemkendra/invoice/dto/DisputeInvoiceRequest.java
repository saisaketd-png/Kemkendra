package com.kemkendra.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public class DisputeInvoiceRequest {
    @NotBlank(message = "Dispute reason is required")
    private String disputeReason;

    public DisputeInvoiceRequest() {}
    public DisputeInvoiceRequest(String disputeReason) { this.disputeReason = disputeReason; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }
}
