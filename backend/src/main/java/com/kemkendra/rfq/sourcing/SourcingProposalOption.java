package com.kemkendra.rfq.sourcing;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sourcing_proposal_options")
public class SourcingProposalOption {

    @Id
    private UUID id;

    @Column(name = "sourcing_proposal_id", nullable = false)
    private UUID sourcingProposalId;

    @Column(name = "sourcing_quotation_id")
    private UUID sourcingQuotationId;

    @Column(name = "option_label", nullable = false, length = 100)
    private String optionLabel;

    @Column(name = "supplier_display_name", nullable = false)
    private String supplierDisplayName;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(length = 100)
    private String grade;

    @Column(name = "purity_specifications", columnDefinition = "TEXT")
    private String puritySpecifications;

    @Column(name = "offered_price_per_unit", nullable = false, precision = 18, scale = 2)
    private BigDecimal offeredPricePerUnit;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(precision = 18, scale = 2)
    private BigDecimal moq;

    @Column(name = "lead_time_days")
    private Integer leadTimeDays;

    @Column(length = 150)
    private String packaging;

    @Column(name = "delivery_terms", length = 150)
    private String deliveryTerms;

    @Column(name = "payment_terms", length = 150)
    private String paymentTerms;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "recommendation_notes", columnDefinition = "TEXT")
    private String recommendationNotes;

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
            status = "OFFERED";
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

    public UUID getSourcingProposalId() {
        return sourcingProposalId;
    }

    public void setSourcingProposalId(UUID sourcingProposalId) {
        this.sourcingProposalId = sourcingProposalId;
    }

    public UUID getSourcingQuotationId() {
        return sourcingQuotationId;
    }

    public void setSourcingQuotationId(UUID sourcingQuotationId) {
        this.sourcingQuotationId = sourcingQuotationId;
    }

    public String getOptionLabel() {
        return optionLabel;
    }

    public void setOptionLabel(String optionLabel) {
        this.optionLabel = optionLabel;
    }

    public String getSupplierDisplayName() {
        return supplierDisplayName;
    }

    public void setSupplierDisplayName(String supplierDisplayName) {
        this.supplierDisplayName = supplierDisplayName;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getPuritySpecifications() {
        return puritySpecifications;
    }

    public void setPuritySpecifications(String puritySpecifications) {
        this.puritySpecifications = puritySpecifications;
    }

    public BigDecimal getOfferedPricePerUnit() {
        return offeredPricePerUnit;
    }

    public void setOfferedPricePerUnit(BigDecimal offeredPricePerUnit) {
        this.offeredPricePerUnit = offeredPricePerUnit;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getMoq() {
        return moq;
    }

    public void setMoq(BigDecimal moq) {
        this.moq = moq;
    }

    public Integer getLeadTimeDays() {
        return leadTimeDays;
    }

    public void setLeadTimeDays(Integer leadTimeDays) {
        this.leadTimeDays = leadTimeDays;
    }

    public String getPackaging() {
        return packaging;
    }

    public void setPackaging(String packaging) {
        this.packaging = packaging;
    }

    public String getDeliveryTerms() {
        return deliveryTerms;
    }

    public void setDeliveryTerms(String deliveryTerms) {
        this.deliveryTerms = deliveryTerms;
    }

    public String getPaymentTerms() {
        return paymentTerms;
    }

    public void setPaymentTerms(String paymentTerms) {
        this.paymentTerms = paymentTerms;
    }

    public LocalDateTime getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDateTime validUntil) {
        this.validUntil = validUntil;
    }

    public String getDocumentUrl() {
        return documentUrl;
    }

    public void setDocumentUrl(String documentUrl) {
        this.documentUrl = documentUrl;
    }

    public String getRecommendationNotes() {
        return recommendationNotes;
    }

    public void setRecommendationNotes(String recommendationNotes) {
        this.recommendationNotes = recommendationNotes;
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
