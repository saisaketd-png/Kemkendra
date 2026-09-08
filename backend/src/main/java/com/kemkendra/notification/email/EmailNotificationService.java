package com.kemkendra.notification.email;

import com.kemkendra.common.ResourceNotFoundException;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationCategory;
import com.kemkendra.notification.NotificationDeliveryLog;
import com.kemkendra.notification.NotificationDeliveryLogRepository;
import com.kemkendra.notification.NotificationRepository;
import com.kemkendra.notification.preference.NotificationPreferenceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service responsible for asynchronous dispatch of notification emails.
 * Failure in email resolution or delivery is isolated and will not impact
 * the caller or the persisted in-app notification.
 * Every dispatch attempt is audited in NotificationDeliveryLog.
 */
@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationEmailTemplateResolver templateResolver;
    private final NotificationPreferenceService preferenceService;
    private final NotificationDeliveryLogRepository deliveryLogRepository;
    private final NotificationRepository notificationRepository;

    public EmailNotificationService(
            UserRepository userRepository,
            EmailService emailService,
            NotificationEmailTemplateResolver templateResolver) {
        this(userRepository, emailService, templateResolver, null, null, null);
    }

    public EmailNotificationService(
            UserRepository userRepository,
            EmailService emailService,
            NotificationEmailTemplateResolver templateResolver,
            NotificationPreferenceService preferenceService) {
        this(userRepository, emailService, templateResolver, preferenceService, null, null);
    }

    @Autowired
    public EmailNotificationService(
            UserRepository userRepository,
            EmailService emailService,
            NotificationEmailTemplateResolver templateResolver,
            @Autowired(required = false) NotificationPreferenceService preferenceService,
            @Autowired(required = false) NotificationDeliveryLogRepository deliveryLogRepository,
            @Autowired(required = false) NotificationRepository notificationRepository) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.templateResolver = templateResolver;
        this.preferenceService = preferenceService;
        this.deliveryLogRepository = deliveryLogRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * Asynchronously sends an email notification for a persisted Notification record.
     * Respects user notification preferences for non-mandatory categories.
     * Records delivery outcomes in NotificationDeliveryLog.
     */
    @Async("emailTaskExecutor")
    public void sendNotificationEmail(Notification notification) {
        if (notification == null) {
            log.warn("Cannot send email: notification is null");
            return;
        }

        UUID recipientId = notification.getRecipientId();
        if (recipientId == null) {
            log.warn("Cannot send email: notification {} has null recipientId", notification.getId());
            return;
        }

        NotificationCategory category = notification.getCategory() != null
                ? notification.getCategory()
                : Notification.deriveCategoryFromType(notification.getType());

        if (preferenceService != null && !preferenceService.isEmailEnabled(recipientId, category)) {
            log.debug("Email notification suppressed by user preference for recipient {} category {}", recipientId, category);
            return;
        }

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) {
            log.warn("Cannot send email for notification {}: recipient user {} not found in database",
                    notification.getId(), recipientId);
            return;
        }

        String recipientEmail = recipient.getEmail();
        if (recipientEmail == null || recipientEmail.isBlank()) {
            log.warn("Cannot send email for notification {}: user {} has no email address",
                    notification.getId(), recipientId);
            return;
        }

        String subject = templateResolver.resolveSubject(notification);
        String htmlBody = templateResolver.buildHtmlBody(notification);

        NotificationDeliveryLog deliveryLog = null;
        if (deliveryLogRepository != null) {
            deliveryLog = new NotificationDeliveryLog();
            deliveryLog.setNotificationId(notification.getId());
            deliveryLog.setRecipientId(recipientId);
            deliveryLog.setRecipientEmail(recipientEmail);
            deliveryLog.setChannel("EMAIL");
            deliveryLog.setNotificationType(notification.getType() != null ? notification.getType().name() : "GENERAL");
            deliveryLog.setSubject(subject);
            deliveryLog.setStatus("PENDING");
            deliveryLog.setLastAttemptedAt(LocalDateTime.now());
            deliveryLog = deliveryLogRepository.save(deliveryLog);
        }

        try {
            emailService.sendHtmlEmail(recipientEmail, subject, htmlBody);

            if (deliveryLog != null && deliveryLogRepository != null) {
                deliveryLog.setStatus("SENT");
                deliveryLog.setLastAttemptedAt(LocalDateTime.now());
                deliveryLogRepository.save(deliveryLog);
            }
            log.info("Email notification successfully sent to {} for notification {}", recipientEmail, notification.getId());
        } catch (Exception e) {
            log.error("Failed to send email notification to {} for notification {}: {}",
                    recipientEmail, notification.getId(), e.getMessage());

            if (deliveryLog != null && deliveryLogRepository != null) {
                deliveryLog.setStatus("FAILED");
                deliveryLog.setErrorMessage(e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName());
                deliveryLog.setLastAttemptedAt(LocalDateTime.now());
                deliveryLogRepository.save(deliveryLog);
            }
        }
    }

    /**
     * Retries a failed email notification log entry.
     */
    @Transactional
    public NotificationDeliveryLog retryDeliveryLog(UUID logId) {
        if (deliveryLogRepository == null) {
            throw new IllegalStateException("DeliveryLogRepository not configured");
        }

        NotificationDeliveryLog deliveryLog = deliveryLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification delivery log not found: " + logId));

        deliveryLog.setRetryCount(deliveryLog.getRetryCount() + 1);
        deliveryLog.setLastAttemptedAt(LocalDateTime.now());

        String subject = deliveryLog.getSubject();
        String htmlBody = null;

        if (deliveryLog.getNotificationId() != null && notificationRepository != null) {
            Notification notification = notificationRepository.findById(deliveryLog.getNotificationId()).orElse(null);
            if (notification != null) {
                subject = templateResolver.resolveSubject(notification);
                htmlBody = templateResolver.buildHtmlBody(notification);
            }
        }

        if (htmlBody == null) {
            htmlBody = "<p>Notification message retry for: " + deliveryLog.getNotificationType() + "</p>";
        }

        try {
            emailService.sendHtmlEmail(deliveryLog.getRecipientEmail(), subject, htmlBody);
            deliveryLog.setStatus("RETRIED");
            deliveryLog.setErrorMessage(null);
        } catch (Exception e) {
            deliveryLog.setStatus("FAILED");
            deliveryLog.setErrorMessage("Retry failed: " + e.getMessage());
            log.error("Retry failed for delivery log {}: {}", logId, e.getMessage());
        }

        return deliveryLogRepository.save(deliveryLog);
    }
}
