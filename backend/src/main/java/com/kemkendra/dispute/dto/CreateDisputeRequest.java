package com.kemkendra.dispute.dto;

import com.kemkendra.dispute.DisputeReason;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public class CreateDisputeRequest {

    private UUID invoiceId;
    private UUID purchaseOrderId;
    private UUID paymentRecordId;

    @NotNull(message = "Dispute reason is required")
    private DisputeReason reason;

    @NotBlank(message = "Description of dispute is required")
    private String description;

    private List<UUID> evidenceDocumentIds;

    public CreateDisputeRequest() {
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public UUID getPaymentRecordId() {
        return paymentRecordId;
    }

    public void setPaymentRecordId(UUID paymentRecordId) {
        this.paymentRecordId = paymentRecordId;
    }

    public DisputeReason getReason() {
        return reason;
    }

    public void setReason(DisputeReason reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<UUID> getEvidenceDocumentIds() {
        return evidenceDocumentIds;
    }

    public void setEvidenceDocumentIds(List<UUID> evidenceDocumentIds) {
        this.evidenceDocumentIds = evidenceDocumentIds;
    }
}
