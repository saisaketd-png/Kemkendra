package com.kemkendra.notification;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.identity.UserStatus;
import com.kemkendra.notification.dto.NotificationResponse;
import com.kemkendra.notification.preference.NotificationPreferenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private static final int DEDUP_WINDOW_SECONDS = 120; // 2-minute deduplication window

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationStreamService notificationStreamService;
    private final NotificationPreferenceService preferenceService;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            NotificationStreamService notificationStreamService,
            NotificationPreferenceService preferenceService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.notificationStreamService = notificationStreamService;
        this.preferenceService = preferenceService;
    }

    @Override
    public Notification createNotification(
            UUID recipientId,
            UUID businessId,
            NotificationType type,
            NotificationCategory category,
            NotificationPriority priority,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {

        if (recipientId == null) {
            log.warn("Cannot create notification: recipientId is null for type {}", type);
            return null;
        }

        NotificationCategory effectiveCategory = category != null ? category : Notification.deriveCategoryFromType(type);
        NotificationPriority effectivePriority = priority != null ? priority : Notification.derivePriorityFromType(type);

        // Check user notification preferences (mandatory categories are always enabled)
        if (preferenceService != null && !preferenceService.isInAppEnabled(recipientId, effectiveCategory)) {
            log.debug("In-app notification suppressed by user preference for recipient {} category {}", recipientId, effectiveCategory);
            return null;
        }

        // Deduplication check: prevent identical notification within dedup window
        if (entityId != null && type != null) {
            LocalDateTime dedupThreshold = LocalDateTime.now().minusSeconds(DEDUP_WINDOW_SECONDS);
            Optional<Notification> duplicate = notificationRepository
                    .findFirstByRecipientIdAndTypeAndEntityIdAndCreatedAtAfterOrderByCreatedAtDesc(
                            recipientId, type, entityId, dedupThreshold);
            if (duplicate.isPresent()) {
                log.info("Suppressed duplicate notification {} for recipient {} within {}s window",
                        type, recipientId, DEDUP_WINDOW_SECONDS);
                return duplicate.get();
            }
        }

        // Sanitize content
        String sanitizedTitle = title != null ? HtmlUtils.htmlEscape(title.trim()) : "Notification";
        String sanitizedMessage = message != null ? HtmlUtils.htmlEscape(message.trim()) : "";

        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setBusinessId(businessId);
        notification.setType(type);
        notification.setCategory(effectiveCategory);
        notification.setPriority(effectivePriority);
        notification.setTitle(sanitizedTitle);
        notification.setMessage(sanitizedMessage);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setRead(false);
        notification.setArchived(false);

        Notification saved = notificationRepository.save(notification);
        log.debug("Created notification {} for recipient {}", saved.getId(), recipientId);

        try {
            long unreadCount = notificationRepository.countByRecipientIdAndReadFalseAndArchivedFalse(recipientId);
            notificationStreamService.sendNotification(recipientId, NotificationResponse.from(saved), unreadCount);
        } catch (Exception e) {
            log.debug("Failed to push real-time notification stream event: {}", e.getMessage());
        }

        return saved;
    }

    @Override
    public Notification createNotification(
            UUID recipientId,
            NotificationType type,
            NotificationCategory category,
            NotificationPriority priority,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        return createNotification(recipientId, null, type, category, priority, title, message, entityType, entityId);
    }

    @Override
    public Notification createNotification(
            UUID recipientId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        return createNotification(
                recipientId,
                null,
                type,
                Notification.deriveCategoryFromType(type),
                Notification.derivePriorityFromType(type),
                title,
                message,
                entityType,
                entityId
        );
    }

    @Override
    public void notifyAdmins(
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        List<User> admins = userRepository.findByRoleAndStatusAndDeletedAtIsNull(UserRole.ADMIN, UserStatus.ACTIVE);
        for (User admin : admins) {
            createNotification(admin.getId(), type, title, message, entityType, entityId);
        }
    }

    @Override
    public Notification notifyUser(
            UUID userId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        return createNotification(userId, type, title, message, entityType, entityId);
    }

    @Override
    public Notification notifyBuyer(
            UUID buyerUserId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        return createNotification(buyerUserId, type, title, message, entityType, entityId);
    }

    @Override
    public Notification notifySupplier(
            UUID supplierUserId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId) {
        return createNotification(supplierUserId, type, title, message, entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(
            UUID recipientId,
            NotificationCategory category,
            Boolean read,
            Pageable pageable) {
        return getNotifications(recipientId, null, category, read, false, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(
            UUID recipientId,
            UUID businessId,
            NotificationCategory category,
            Boolean read,
            Boolean archived,
            Pageable pageable) {

        int pageNumber = Math.max(0, pageable.getPageNumber());
        int pageSize = Math.min(Math.max(1, pageable.getPageSize()), 100);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id"));
        Pageable boundedPageable = PageRequest.of(pageNumber, pageSize, sort);

        Specification<Notification> spec = (root, query, cb) -> {
            var predicates = new ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.equal(root.get("recipientId"), recipientId));

            if (businessId != null) {
                predicates.add(cb.equal(root.get("businessId"), businessId));
            }
            if (category != null) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (read != null) {
                predicates.add(cb.equal(root.get("read"), read));
            }
            if (archived != null) {
                predicates.add(cb.equal(root.get("archived"), archived));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        return notificationRepository.findAll(spec, boundedPageable)
                .map(NotificationResponse::from);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(UUID recipientId, Pageable pageable) {
        return getNotifications(recipientId, null, null, null, false, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalseAndArchivedFalse(recipientId);
    }

    @Override
    public NotificationResponse markAsRead(UUID notificationId, UUID recipientId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    @Override
    public int markAllAsRead(UUID recipientId) {
        List<Notification> unreadList = notificationRepository.findByRecipientIdAndReadFalseAndArchivedFalse(recipientId);
        if (unreadList.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Notification n : unreadList) {
            n.setRead(true);
            n.setReadAt(now);
        }

        notificationRepository.saveAll(unreadList);
        return unreadList.size();
    }

    @Override
    public NotificationResponse archiveNotification(UUID notificationId, UUID recipientId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notification.setArchived(true);
        Notification saved = notificationRepository.save(notification);
        return NotificationResponse.from(saved);
    }

    @Override
    public void deleteNotification(UUID notificationId, UUID recipientId) {
        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }

    @Override
    public long cleanUpOldNotifications(int retentionDays) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(Math.max(1, retentionDays));
        long deleted = notificationRepository.deleteByCreatedAtBefore(threshold);
        log.info("Notification retention cleanup purged {} records older than {} days", deleted, retentionDays);
        return deleted;
    }

    @Scheduled(cron = "${kemkendra.notifications.cleanup-cron:0 0 3 * * ?}")
    public void scheduledRetentionCleanup() {
        cleanUpOldNotifications(90);
    }
}
