package com.kemkendra.rfq.sourcing;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sourcing_quotations")
public class SourcingQuotation {

    @Id
    private UUID id;

    @Column(name = "sourcing_request_id", nullable = false)
    private UUID sourcingRequestId;

    @Column(name = "sourcing_supplier_id")
    private UUID sourcingSupplierId;

    @Column(name = "quotation_reference", length = 50)
    private String quotationReference;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "unit_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "currency", nullable = false, length = 10)
    private String currency;

    @Column(length = 20)
    private String unit;

    @Column(name = "minimum_order_quantity", precision = 18, scale = 2)
    private BigDecimal minimumOrderQuantity;

    @Column(name = "available_quantity", precision = 18, scale = 2)
    private BigDecimal availableQuantity;

    @Column(name = "product_grade", length = 100)
    private String productGrade;

    @Column(name = "purity_specifications", columnDefinition = "TEXT")
    private String puritySpecifications;

    @Column(length = 150)
    private String packaging;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(name = "delivery_charges", precision = 18, scale = 2)
    private BigDecimal deliveryCharges;

    @Column(name = "payment_terms", length = 150)
    private String paymentTerms;

    @Column(name = "incoterms", length = 50)
    private String incoterms;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "supporting_documents", columnDefinition = "TEXT")
    private String supportingDocuments;

    @Column(name = "share_with_buyer")
    private Boolean shareWithBuyer = false;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (currency == null) {
            currency = "INR";
        }
        if (status == null) {
            status = "RECEIVED";
        }
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSourcingRequestId() {
        return sourcingRequestId;
    }

    public void setSourcingRequestId(UUID sourcingRequestId) {
        this.sourcingRequestId = sourcingRequestId;
    }

    public UUID getSourcingSupplierId() {
        return sourcingSupplierId;
    }

    public void setSourcingSupplierId(UUID sourcingSupplierId) {
        this.sourcingSupplierId = sourcingSupplierId;
    }

    public String getQuotationReference() {
        return quotationReference;
    }

    public void setQuotationReference(String quotationReference) {
        this.quotationReference = quotationReference;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getMinimumOrderQuantity() {
        return minimumOrderQuantity;
    }

    public void setMinimumOrderQuantity(BigDecimal minimumOrderQuantity) {
        this.minimumOrderQuantity = minimumOrderQuantity;
    }

    public Integer getLeadTimeDays() {
        return leadTimeDays;
    }

    public void setLeadTimeDays(Integer leadTimeDays) {
        this.leadTimeDays = leadTimeDays;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public String getIncoterms() {
        return incoterms;
    }

    public void setIncoterms(String incoterms) {
        this.incoterms = incoterms;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(BigDecimal availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public String getProductGrade() {
        return productGrade;
    }

    public void setProductGrade(String productGrade) {
        this.productGrade = productGrade;
    }

    public String getPuritySpecifications() {
        return puritySpecifications;
    }

    public void setPuritySpecifications(String puritySpecifications) {
        this.puritySpecifications = puritySpecifications;
    }

    public String getPackaging() {
        return packaging;
    }

    public void setPackaging(String packaging) {
        this.packaging = packaging;
    }

    public BigDecimal getDeliveryCharges() {
        return deliveryCharges;
    }

    public void setDeliveryCharges(BigDecimal deliveryCharges) {
        this.deliveryCharges = deliveryCharges;
    }

    public String getSupportingDocuments() {
        return supportingDocuments;
    }

    public void setSupportingDocuments(String supportingDocuments) {
        this.supportingDocuments = supportingDocuments;
    }

    public Boolean getShareWithBuyer() {
        return shareWithBuyer;
    }

    public void setShareWithBuyer(Boolean shareWithBuyer) {
        this.shareWithBuyer = shareWithBuyer;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
