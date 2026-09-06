package com.kemkendra.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public class CancelInvoiceRequest {
    @NotBlank(message = "Cancellation reason is required")
    private String cancellationReason;

    public CancelInvoiceRequest() {}
    public CancelInvoiceRequest(String cancellationReason) { this.cancellationReason = cancellationReason; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}
