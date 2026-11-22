package com.kemkendra.rfq.sourcing;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sourcing_proposals")
public class SourcingProposal {

    @Id
    private UUID id;

    @Column(name = "sourcing_request_id", nullable = false)
    private UUID sourcingRequestId;

    @Column(name = "proposal_reference", nullable = false, unique = true, length = 50)
    private String proposalReference;

    @Column(nullable = false)
    private String title;

    @Column(name = "offered_price_per_unit", nullable = false, precision = 18, scale = 2)
    private BigDecimal offeredPricePerUnit;

    @Column(nullable = false, length = 10)
    private String currency;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "estimated_delivery_days")
    private Integer estimatedDeliveryDays;

    @Column(name = "terms_and_conditions", columnDefinition = "TEXT")
    private String termsAndConditions;

    @Column(name = "summary_notes", columnDefinition = "TEXT")
    private String summaryNotes;

    @Column(name = "recommendation_notes", columnDefinition = "TEXT")
    private String recommendationNotes;

    @Column(name = "buyer_feedback", columnDefinition = "TEXT")
    private String buyerFeedback;

    @Column(name = "selected_option_id")
    private UUID selectedOptionId;

    @Column(name = "proposal_document_url", length = 500)
    private String proposalDocumentUrl;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "sent_to_buyer_at")
    private LocalDateTime sentToBuyerAt;

    @Column(name = "buyer_decision_at")
    private LocalDateTime buyerDecisionAt;

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
            status = "DRAFT";
        }
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (proposalReference == null) {
            String prefix = id.toString().substring(0, 8).toUpperCase();
            proposalReference = String.format("PROP-%d-%s", createdAt.getYear(), prefix);
        }
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

    public String getProposalReference() {
        return proposalReference;
    }

    public void setProposalReference(String proposalReference) {
        this.proposalReference = proposalReference;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public Integer getEstimatedDeliveryDays() {
        return estimatedDeliveryDays;
    }

    public void setEstimatedDeliveryDays(Integer estimatedDeliveryDays) {
        this.estimatedDeliveryDays = estimatedDeliveryDays;
    }

    public String getTermsAndConditions() {
        return termsAndConditions;
    }

    public void setTermsAndConditions(String termsAndConditions) {
        this.termsAndConditions = termsAndConditions;
    }

    public String getProposalDocumentUrl() {
        return proposalDocumentUrl;
    }

    public void setProposalDocumentUrl(String proposalDocumentUrl) {
        this.proposalDocumentUrl = proposalDocumentUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSentToBuyerAt() {
        return sentToBuyerAt;
    }

    public void setSentToBuyerAt(LocalDateTime sentToBuyerAt) {
        this.sentToBuyerAt = sentToBuyerAt;
    }

    public LocalDateTime getBuyerDecisionAt() {
        return buyerDecisionAt;
    }

    public void setBuyerDecisionAt(LocalDateTime buyerDecisionAt) {
        this.buyerDecisionAt = buyerDecisionAt;
    }

    public String getSummaryNotes() {
        return summaryNotes;
    }

    public void setSummaryNotes(String summaryNotes) {
        this.summaryNotes = summaryNotes;
    }

    public String getRecommendationNotes() {
        return recommendationNotes;
    }

    public void setRecommendationNotes(String recommendationNotes) {
        this.recommendationNotes = recommendationNotes;
    }

    public String getBuyerFeedback() {
        return buyerFeedback;
    }

    public void setBuyerFeedback(String buyerFeedback) {
        this.buyerFeedback = buyerFeedback;
    }

    public UUID getSelectedOptionId() {
        return selectedOptionId;
    }

    public void setSelectedOptionId(UUID selectedOptionId) {
        this.selectedOptionId = selectedOptionId;
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
