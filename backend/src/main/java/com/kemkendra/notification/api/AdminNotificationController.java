package com.kemkendra.notification.api;

import com.kemkendra.notification.NotificationDeliveryLog;
import com.kemkendra.notification.NotificationDeliveryLogRepository;
import com.kemkendra.notification.email.EmailNotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.UUID;

/**
 * Administrative endpoints for monitoring notification delivery logs,
 * diagnosing failures, and triggering manual retries.
 */
@RestController
@RequestMapping("/api/v1/admin/notifications")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNotificationController {

    private final NotificationDeliveryLogRepository deliveryLogRepository;
    private final EmailNotificationService emailNotificationService;

    public AdminNotificationController(
            NotificationDeliveryLogRepository deliveryLogRepository,
            EmailNotificationService emailNotificationService) {
        this.deliveryLogRepository = deliveryLogRepository;
        this.emailNotificationService = emailNotificationService;
    }

    @GetMapping("/delivery-logs")
    public Page<NotificationDeliveryLog> getDeliveryLogs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String notificationType,
            @RequestParam(required = false) String recipientEmail,
            Pageable pageable) {

        int pageNumber = Math.max(0, pageable.getPageNumber());
        int pageSize = Math.min(Math.max(1, pageable.getPageSize()), 100);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable boundedPageable = PageRequest.of(pageNumber, pageSize, sort);

        Specification<NotificationDeliveryLog> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();

            if (status != null && !status.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("status")), status.trim().toUpperCase()));
            }
            if (notificationType != null && !notificationType.isBlank()) {
                predicates.add(cb.equal(root.get("notificationType"), notificationType.trim()));
            }
            if (recipientEmail != null && !recipientEmail.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("recipientEmail")), "%" + recipientEmail.trim().toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return deliveryLogRepository.findAll(spec, boundedPageable);
    }

    @PostMapping("/delivery-logs/{id}/retry")
    public ResponseEntity<NotificationDeliveryLog> retryDelivery(@PathVariable UUID id) {
        NotificationDeliveryLog updatedLog = emailNotificationService.retryDeliveryLog(id);
        return ResponseEntity.ok(updatedLog);
    }
}
