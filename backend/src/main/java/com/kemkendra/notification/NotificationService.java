package com.kemkendra.notification;

import com.kemkendra.notification.dto.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {

    Notification createNotification(
            UUID recipientId,
            NotificationType type,
            NotificationCategory category,
            NotificationPriority priority,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Notification createNotification(
            UUID recipientId,
            UUID businessId,
            NotificationType type,
            NotificationCategory category,
            NotificationPriority priority,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Notification createNotification(
            UUID recipientId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    void notifyAdmins(
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Notification notifyUser(
            UUID userId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Notification notifyBuyer(
            UUID buyerUserId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Notification notifySupplier(
            UUID supplierUserId,
            NotificationType type,
            String title,
            String message,
            NotificationEntityType entityType,
            UUID entityId);

    Page<NotificationResponse> getNotifications(
            UUID recipientId,
            NotificationCategory category,
            Boolean read,
            Pageable pageable);

    Page<NotificationResponse> getNotifications(
            UUID recipientId,
            UUID businessId,
            NotificationCategory category,
            Boolean read,
            Boolean archived,
            Pageable pageable);

    Page<NotificationResponse> getNotifications(UUID recipientId, Pageable pageable);

    long getUnreadCount(UUID recipientId);

    NotificationResponse markAsRead(UUID notificationId, UUID recipientId);

    int markAllAsRead(UUID recipientId);

    NotificationResponse archiveNotification(UUID notificationId, UUID recipientId);

    void deleteNotification(UUID notificationId, UUID recipientId);

    long cleanUpOldNotifications(int retentionDays);
}
