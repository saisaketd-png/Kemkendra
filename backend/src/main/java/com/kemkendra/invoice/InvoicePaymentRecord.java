package com.kemkendra.invoice;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoice_payment_records")
public class InvoicePaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(name = "recorded_by_id", nullable = false)
    private UUID recordedById;

    @Column(name = "payment_reference", nullable = false, length = 100)
    private String paymentReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 50)
    private PaymentMode paymentMode = PaymentMode.NEFT;

    @Column(name = "payment_date", nullable = false)
    private LocalDate paymentDate;

    @Column(name = "amount_paid", nullable = false, precision = 18, scale = 4)
    private BigDecimal amountPaid;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "proof_document_id")
    private UUID proofDocumentId;

    @Column(name = "purchase_order_id")
    private UUID purchaseOrderId;

    @Column(name = "buyer_id")
    private UUID buyerId;

    @Column(name = "supplier_id")
    private Long supplierId;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "proof_file_name")
    private String proofFileName;

    @Column(name = "proof_file_size")
    private Long proofFileSize;

    @Column(name = "proof_content_type", length = 100)
    private String proofContentType;

    @Column(name = "proof_storage_key", length = 500)
    private String proofStorageKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PROOF_UPLOADED;

    @Column(name = "reviewed_by_id")
    private UUID reviewedById;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "confirmed_by_id")
    private UUID confirmedById;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "info_requested_notes", columnDefinition = "TEXT")
    private String infoRequestedNotes;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public InvoicePaymentRecord() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public UUID getRecordedById() {
        return recordedById;
    }

    public void setRecordedById(UUID recordedById) {
        this.recordedById = recordedById;
    }

    public String getPaymentReference() {
        return paymentReference;
    }

    public void setPaymentReference(String paymentReference) {
        this.paymentReference = paymentReference;
    }

    public PaymentMode getPaymentMode() {
        return paymentMode;
    }

    public void setPaymentMode(PaymentMode paymentMode) {
        this.paymentMode = paymentMode;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public UUID getProofDocumentId() {
        return proofDocumentId;
    }

    public void setProofDocumentId(UUID proofDocumentId) {
        this.proofDocumentId = proofDocumentId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public UUID getReviewedById() {
        return reviewedById;
    }

    public void setReviewedById(UUID reviewedById) {
        this.reviewedById = reviewedById;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }

    public String getDisputeReason() {
        return disputeReason;
    }

    public void setDisputeReason(String disputeReason) {
        this.disputeReason = disputeReason;
    }

    public UUID getPurchaseOrderId() {
        return purchaseOrderId;
    }

    public void setPurchaseOrderId(UUID purchaseOrderId) {
        this.purchaseOrderId = purchaseOrderId;
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

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getProofFileName() {
        return proofFileName;
    }

    public void setProofFileName(String proofFileName) {
        this.proofFileName = proofFileName;
    }

    public Long getProofFileSize() {
        return proofFileSize;
    }

    public void setProofFileSize(Long proofFileSize) {
        this.proofFileSize = proofFileSize;
    }

    public String getProofContentType() {
        return proofContentType;
    }

    public void setProofContentType(String proofContentType) {
        this.proofContentType = proofContentType;
    }

    public String getProofStorageKey() {
        return proofStorageKey;
    }

    public void setProofStorageKey(String proofStorageKey) {
        this.proofStorageKey = proofStorageKey;
    }

    public UUID getConfirmedById() {
        return confirmedById;
    }

    public void setConfirmedById(UUID confirmedById) {
        this.confirmedById = confirmedById;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getInfoRequestedNotes() {
        return infoRequestedNotes;
    }

    public void setInfoRequestedNotes(String infoRequestedNotes) {
        this.infoRequestedNotes = infoRequestedNotes;
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
