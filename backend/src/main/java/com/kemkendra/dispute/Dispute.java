package com.kemkendra.dispute;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "disputes")
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "dispute_number", nullable = false, unique = true, length = 50)
    private String disputeNumber;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "invoice_number", length = 50)
    private String invoiceNumber;

    @Column(name = "purchase_order_id")
    private UUID purchaseOrderId;

    @Column(name = "po_number", length = 50)
    private String poNumber;

    @Column(name = "payment_record_id")
    private UUID paymentRecordId;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "supplier_id", nullable = false)
    private Long supplierId;

    @Column(name = "raised_by_id", nullable = false)
    private UUID raisedById;

    @Column(name = "raised_by_role", nullable = false, length = 20)
    private String raisedByRole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DisputeReason reason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DisputeStatus status = DisputeStatus.OPEN;

    @Column(name = "assigned_admin_id")
    private UUID assignedAdminId;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_by_id")
    private UUID resolvedById;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<DisputeAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "dispute", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<DisputeTimelineEvent> timelineEvents = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Dispute() {
    }

    public void addAttachment(DisputeAttachment attachment) {
        attachments.add(attachment);
        attachment.setDispute(this);
    }

    public void addTimelineEvent(DisputeTimelineEvent event) {
        timelineEvents.add(event);
        event.setDispute(this);
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDisputeNumber() {
        return disputeNumber;
    }

    public void setDisputeNumber(String disputeNumber) {
        this.disputeNumber = disputeNumber;
    }

    public UUID getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(UUID invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public UUID getPaymentRecordId() {
        return paymentRecordId;
    }

    public void setPaymentRecordId(UUID paymentRecordId) {
        this.paymentRecordId = paymentRecordId;
    }

    public UUID getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(UUID buyerId) {
        this.buyerId = buyerId;
    }

    public Long getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Long supplierId) {
        this.supplierId = supplierId;
    }

    public UUID getRaisedById() {
        return raisedById;
    }

    public void setRaisedById(UUID raisedById) {
        this.raisedById = raisedById;
    }

    public String getRaisedByRole() {
        return raisedByRole;
    }

    public void setRaisedByRole(String raisedByRole) {
        this.raisedByRole = raisedByRole;
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

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
        this.status = status;
    }

    public UUID getAssignedAdminId() {
        return assignedAdminId;
    }

    public void setAssignedAdminId(UUID assignedAdminId) {
        this.assignedAdminId = assignedAdminId;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public UUID getResolvedById() {
        return resolvedById;
    }

    public void setResolvedById(UUID resolvedById) {
        this.resolvedById = resolvedById;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public List<DisputeAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<DisputeAttachment> attachments) {
        this.attachments = attachments;
    }

    public List<DisputeTimelineEvent> getTimelineEvents() {
        return timelineEvents;
    }

    public void setTimelineEvents(List<DisputeTimelineEvent> timelineEvents) {
        this.timelineEvents = timelineEvents;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
