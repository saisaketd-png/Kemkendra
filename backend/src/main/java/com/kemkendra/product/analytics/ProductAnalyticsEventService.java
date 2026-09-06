package com.kemkendra.product.analytics;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ProductAnalyticsEventService {

    private static final Logger log = LoggerFactory.getLogger(ProductAnalyticsEventService.class);
    private final ProductAnalyticsEventRepository repository;

    public ProductAnalyticsEventService(ProductAnalyticsEventRepository repository) {
        this.repository = repository;
    }

    @Async
    @Transactional
    public void recordSearchEvent(String query, String category) {
        if (query == null || query.trim().length() < 2) {
            return;
        }
        try {
            String sanitized = query.trim().toLowerCase();
            if (sanitized.length() > 100) {
                sanitized = sanitized.substring(0, 100);
            }
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("SEARCH", sanitized, null, category);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record product search event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordViewEvent(UUID masterProductId, String category) {
        if (masterProductId == null) {
            return;
        }
        try {
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("VIEW", null, masterProductId, category);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record product view event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordCategoryView(String category) {
        if (category == null || category.isBlank()) {
            return;
        }
        try {
            String cat = category.trim();
            if (cat.length() > 100) cat = cat.substring(0, 100);
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("CATEGORY_VIEW", null, null, cat);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record category view event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordSupplierView(Long supplierId) {
        if (supplierId == null) {
            return;
        }
        try {
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("SUPPLIER_VIEW", String.valueOf(supplierId), null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record supplier view event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordRegistrationStarted(String userType) {
        try {
            String meta = userType != null ? userType.trim() : "USER";
            if (meta.length() > 50) meta = meta.substring(0, 50);
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("REG_START", meta, null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record registration start event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordRegistrationCompleted(String userType) {
        try {
            String meta = userType != null ? userType.trim() : "USER";
            if (meta.length() > 50) meta = meta.substring(0, 50);
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("REG_COMPLETE", meta, null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record registration complete event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordRfqStarted() {
        try {
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("RFQ_START", null, null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record RFQ start event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordRfqSubmitted() {
        try {
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("RFQ_SUBMIT", null, null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record RFQ submit event: {}", e.getMessage());
        }
    }

    @Async
    @Transactional
    public void recordContactSubmitted() {
        try {
            ProductAnalyticsEvent event = new ProductAnalyticsEvent("CONTACT_SUBMIT", null, null, null);
            repository.save(event);
        } catch (Exception e) {
            log.warn("Failed to record contact submitted event: {}", e.getMessage());
        }
    }
}
