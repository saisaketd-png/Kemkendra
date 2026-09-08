package com.kemkendra.invoice.dto;

import com.kemkendra.invoice.PaymentMode;
import com.kemkendra.invoice.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class InvoicePaymentRecordDto {

    private UUID id;
    private UUID invoiceId;
    private UUID purchaseOrderId;
    private UUID buyerId;
    private Long supplierId;
    private UUID recordedById;
    private String paymentReference;
    private PaymentMode paymentMode;
    private LocalDate paymentDate;
    private BigDecimal amountPaid;
    private String currency;
    private String notes;
    private String bankName;
    private UUID proofDocumentId;
    private String proofFileName;
    private Long proofFileSize;
    private String proofContentType;
    private PaymentStatus status;
    private UUID reviewedById;
    private LocalDateTime reviewedAt;
    private UUID confirmedById;
    private LocalDateTime confirmedAt;
    private String reviewNotes;
    private String rejectionReason;
    private String infoRequestedNotes;
    private String disputeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InvoicePaymentRecordDto() {
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getInvoiceId() { return invoiceId; }
    public void setInvoiceId(UUID invoiceId) { this.invoiceId = invoiceId; }

    public UUID getPurchaseOrderId() { return purchaseOrderId; }
    public void setPurchaseOrderId(UUID purchaseOrderId) { this.purchaseOrderId = purchaseOrderId; }

    public UUID getBuyerId() { return buyerId; }
    public void setBuyerId(UUID buyerId) { this.buyerId = buyerId; }

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }

    public UUID getRecordedById() { return recordedById; }
    public void setRecordedById(UUID recordedById) { this.recordedById = recordedById; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public PaymentMode getPaymentMode() { return paymentMode; }
    public void setPaymentMode(PaymentMode paymentMode) { this.paymentMode = paymentMode; }

    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }

    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }

    public UUID getProofDocumentId() { return proofDocumentId; }
    public void setProofDocumentId(UUID proofDocumentId) { this.proofDocumentId = proofDocumentId; }

    public String getProofFileName() { return proofFileName; }
    public void setProofFileName(String proofFileName) { this.proofFileName = proofFileName; }

    public Long getProofFileSize() { return proofFileSize; }
    public void setProofFileSize(Long proofFileSize) { this.proofFileSize = proofFileSize; }

    public String getProofContentType() { return proofContentType; }
    public void setProofContentType(String proofContentType) { this.proofContentType = proofContentType; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public UUID getReviewedById() { return reviewedById; }
    public void setReviewedById(UUID reviewedById) { this.reviewedById = reviewedById; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }

    public UUID getConfirmedById() { return confirmedById; }
    public void setConfirmedById(UUID confirmedById) { this.confirmedById = confirmedById; }

    public LocalDateTime getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(LocalDateTime confirmedAt) { this.confirmedAt = confirmedAt; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getInfoRequestedNotes() { return infoRequestedNotes; }
    public void setInfoRequestedNotes(String infoRequestedNotes) { this.infoRequestedNotes = infoRequestedNotes; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
