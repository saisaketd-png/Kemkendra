package com.kemkendra.dispute.dto;

import com.kemkendra.dispute.DisputeReason;
import com.kemkendra.dispute.DisputeStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class DisputeDto {

    private UUID id;
    private String disputeNumber;
    private UUID invoiceId;
    private String invoiceNumber;
    private UUID purchaseOrderId;
    private String poNumber;
    private UUID paymentRecordId;
    private UUID buyerId;
    private Long supplierId;
    private UUID raisedById;
    private String raisedByRole;
    private DisputeReason reason;
    private String description;
    private DisputeStatus status;
    private UUID assignedAdminId;
    private String resolutionNotes;
    private UUID resolvedById;
    private LocalDateTime resolvedAt;
    private List<DisputeAttachmentDto> attachments = new ArrayList<>();
    private List<DisputeTimelineEventDto> timelineEvents = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DisputeDto() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDisputeNumber() { return disputeNumber; }
    public void setDisputeNumber(String disputeNumber) { this.disputeNumber = disputeNumber; }

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public UUID getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(UUID purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public UUID getPaymentRecordId() { return paymentRecordId; }
    public void setPaymentRecordId(UUID paymentRecordId) { this.paymentRecordId = paymentRecordId; }

    public UUID getBuyerId() { return buyerId; }
    public void setBuyerId(UUID buyerId) { this.buyerId = buyerId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public UUID getRaisedById() { return raisedById; }
    public void setRaisedById(UUID raisedById) { this.raisedById = raisedById; }

    public String getRaisedByRole() { return raisedByRole; }
    public void setRaisedByRole(String raisedByRole) { this.raisedByRole = raisedByRole; }

    public DisputeReason getReason() { return reason; }
    public void setReason(DisputeReason reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public DisputeStatus getStatus() { return status; }
    public void setStatus(DisputeStatus status) { this.status = status; }

    public UUID getAssignedAdminId() { return assignedAdminId; }
    public void setAssignedAdminId(UUID assignedAdminId) { this.assignedAdminId = assignedAdminId; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public UUID getResolvedById() { return resolvedById; }
    public void setResolvedById(UUID resolvedById) { this.resolvedById = resolvedById; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<DisputeAttachmentDto> getAttachments() { return attachments; }
    public void setAttachments(List<DisputeAttachmentDto> attachments) { this.attachments = attachments; }

    public List<DisputeTimelineEventDto> getTimelineEvents() { return timelineEvents; }
    public void setTimelineEvents(List<DisputeTimelineEventDto> timelineEvents) { this.timelineEvents = timelineEvents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
