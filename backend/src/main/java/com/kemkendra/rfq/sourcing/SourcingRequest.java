package com.kemkendra.rfq.sourcing;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sourcing_requests")
public class SourcingRequest {

    @Id
    private UUID id;

    @Column(name = "sourcing_request_reference", nullable = false, unique = true, length = 30)
    private String sourcingRequestReference;

    @Column(name = "buyer_id", nullable = false)
    private UUID buyerId;

    @Column(name = "product_name")
    private String productName;

    @Column(name = "cas_number", length = 100)
    private String casNumber;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "grade", length = 100)
    private String grade;

    @Column(name = "specifications", columnDefinition = "TEXT")
    private String specifications;

    @Column(name = "pharmacopeial_standard", length = 50)
    private String pharmacopeialStandard;

    @Column(name = "delivery_location")
    private String deliveryLocation;

    @Column(name = "packaging", length = 150)
    private String packaging;

    @Column(name = "target_price", precision = 18, scale = 2)
    private BigDecimal targetPrice;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Column(name = "additional_requirements", columnDefinition = "TEXT")
    private String additionalRequirements;

    @Column(name = "attachment_references", columnDefinition = "TEXT")
    private String attachmentReferences;

    @Column(name = "assigned_to_user_id")
    private UUID assignedToUserId;

    @Column(name = "master_product_id")
    private UUID masterProductId;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "target_quantity", nullable = false, precision = 18, scale = 2)
    private BigDecimal targetQuantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SourcingRequestStatus status;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (status == null) {
            status = SourcingRequestStatus.SUBMITTED;
        }
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (sourcingRequestReference == null) {
            String prefix = id.toString().substring(0, 8).toUpperCase();
            sourcingRequestReference = String.format("SRQ-%d-%s", createdAt.getYear(), prefix);
        }
        if (currency == null) {
            currency = "INR";
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

    public String getSourcingRequestReference() {
        return sourcingRequestReference;
    }

    public void setSourcingRequestReference(String sourcingRequestReference) {
        this.sourcingRequestReference = sourcingRequestReference;
    }

    public UUID getBuyerId() {
        return buyerId;
    }

    public void setBuyerId(UUID buyerId) {
        this.buyerId = buyerId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCasNumber() {
        return casNumber;
    }

    public void setCasNumber(String casNumber) {
        this.casNumber = casNumber;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public String getPharmacopeialStandard() {
        return pharmacopeialStandard;
    }

    public void setPharmacopeialStandard(String pharmacopeialStandard) {
        this.pharmacopeialStandard = pharmacopeialStandard;
    }

    public String getDeliveryLocation() {
        return deliveryLocation;
    }

    public void setDeliveryLocation(String deliveryLocation) {
        this.deliveryLocation = deliveryLocation;
    }

    public String getPackaging() {
        return packaging;
    }

    public void setPackaging(String packaging) {
        this.packaging = packaging;
    }

    public BigDecimal getTargetPrice() {
        return targetPrice;
    }

    public void setTargetPrice(BigDecimal targetPrice) {
        this.targetPrice = targetPrice;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public String getAdditionalRequirements() {
        return additionalRequirements;
    }

    public void setAdditionalRequirements(String additionalRequirements) {
        this.additionalRequirements = additionalRequirements;
    }

    public String getAttachmentReferences() {
        return attachmentReferences;
    }

    public void setAttachmentReferences(String attachmentReferences) {
        this.attachmentReferences = attachmentReferences;
    }

    public UUID getAssignedToUserId() {
        return assignedToUserId;
    }

    public void setAssignedToUserId(UUID assignedToUserId) {
        this.assignedToUserId = assignedToUserId;
    }

    public UUID getMasterProductId() {
        return masterProductId;
    }

    public void setMasterProductId(UUID masterProductId) {
        this.masterProductId = masterProductId;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public BigDecimal getTargetQuantity() {
        return targetQuantity;
    }

    public void setTargetQuantity(BigDecimal targetQuantity) {
        this.targetQuantity = targetQuantity;
    }

    public BigDecimal getQuantity() {
        return targetQuantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.targetQuantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public SourcingRequestStatus getStatus() {
        return status;
    }

    public void setStatus(SourcingRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
