package com.kemkendra.product.analytics.api;

import com.kemkendra.product.analytics.ProductAnalyticsEventService;
import com.kemkendra.product.analytics.dto.PublicEventTrackRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/analytics")
public class PublicAnalyticsTrackingController {

    private final ProductAnalyticsEventService analyticsEventService;

    public PublicAnalyticsTrackingController(ProductAnalyticsEventService analyticsEventService) {
        this.analyticsEventService = analyticsEventService;
    }

    @PostMapping("/track")
    public ResponseEntity<Map<String, Boolean>> trackEvent(@Valid @RequestBody PublicEventTrackRequest request) {
        if (request == null || request.eventType() == null) {
            return ResponseEntity.ok(Map.of("tracked", false));
        }

        String type = request.eventType().toUpperCase().trim();

        switch (type) {
            case "CATEGORY_VIEW" -> {
                String cat = request.category() != null ? request.category() : request.identifier();
                analyticsEventService.recordCategoryView(cat);
            }
            case "SUPPLIER_VIEW" -> {
                try {
                    if (request.identifier() != null) {
                        Long sId = Long.parseLong(request.identifier().trim());
                        analyticsEventService.recordSupplierView(sId);
                    }
                } catch (NumberFormatException ignored) {}
            }
            case "PRODUCT_VIEW" -> {
                try {
                    if (request.identifier() != null) {
                        UUID pId = UUID.fromString(request.identifier().trim());
                        analyticsEventService.recordViewEvent(pId, request.category());
                    }
                } catch (IllegalArgumentException ignored) {}
            }
            case "SEARCH" -> {
                if (request.identifier() != null) {
                    analyticsEventService.recordSearchEvent(request.identifier(), request.category());
                }
            }
            case "REG_START" -> analyticsEventService.recordRegistrationStarted(request.identifier());
            case "REG_COMPLETE" -> analyticsEventService.recordRegistrationCompleted(request.identifier());
            case "RFQ_START" -> analyticsEventService.recordRfqStarted();
            case "RFQ_SUBMIT" -> analyticsEventService.recordRfqSubmitted();
            case "CONTACT_SUBMIT" -> analyticsEventService.recordContactSubmitted();
            default -> {
                // Unknown public event type safely ignored
                return ResponseEntity.ok(Map.of("tracked", false));
            }
        }

        return ResponseEntity.ok(Map.of("tracked", true));
    }
}
