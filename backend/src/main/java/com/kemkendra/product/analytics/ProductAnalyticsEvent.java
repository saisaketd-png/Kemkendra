package com.kemkendra.product.analytics;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_analytics_events")
public class ProductAnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType; // 'SEARCH', 'VIEW'

    @Column(name = "search_term", length = 255)
    private String searchTerm;

    @Column(name = "master_product_id")
    private UUID masterProductId;

    @Column(name = "category", length = 100)
    private String category;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ProductAnalyticsEvent() {
    }

    public ProductAnalyticsEvent(String eventType, String searchTerm, UUID masterProductId, String category) {
        this.eventType = eventType;
        this.searchTerm = searchTerm;
        this.masterProductId = masterProductId;
        this.category = category;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getSearchTerm() {
        return searchTerm;
    }

    public void setSearchTerm(String searchTerm) {
        this.searchTerm = searchTerm;
    }

    public UUID getMasterProductId() {
        return masterProductId;
    }

    public void setMasterProductId(UUID masterProductId) {
        this.masterProductId = masterProductId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
