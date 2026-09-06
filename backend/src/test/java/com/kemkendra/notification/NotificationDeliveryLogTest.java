package com.kemkendra.notification;

import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.identity.UserRole;
import com.kemkendra.notification.email.EmailNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class NotificationDeliveryLogTest {

    @Autowired private NotificationDeliveryLogRepository deliveryLogRepository;
    @Autowired private EmailNotificationService emailNotificationService;
    @Autowired private UserRepository userRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User recipient;

    @BeforeEach
    public void setup() {
        jdbcTemplate.execute("DELETE FROM notification_delivery_logs; DELETE FROM notifications; DELETE FROM user_notification_preferences; DELETE FROM users;");

        recipient = new User();
        recipient.setEmail("client@company.com");
        recipient.setName("Client User");
        recipient.setPasswordHash("hash");
        recipient.setRole(UserRole.USER);
        recipient = userRepository.save(recipient);
    }

    @Test
    public void testDeliveryLog_CreationAndQuerying() {
        NotificationDeliveryLog log1 = new NotificationDeliveryLog();
        log1.setRecipientId(recipient.getId());
        log1.setRecipientEmail(recipient.getEmail());
        log1.setChannel("EMAIL");
        log1.setNotificationType("INVOICE_ISSUED");
        log1.setSubject("[KemKendra] Tax Invoice Issued: INV-2026-0001");
        log1.setStatus("SENT");
        log1.setLastAttemptedAt(LocalDateTime.now());
        deliveryLogRepository.save(log1);

        NotificationDeliveryLog log2 = new NotificationDeliveryLog();
        log2.setRecipientId(recipient.getId());
        log2.setRecipientEmail(recipient.getEmail());
        log2.setChannel("EMAIL");
        log2.setNotificationType("PAYMENT_CONFIRMED");
        log2.setSubject("[KemKendra] Payment Confirmed");
        log2.setStatus("FAILED");
        log2.setErrorMessage("SMTP connection timeout");
        log2.setLastAttemptedAt(LocalDateTime.now());
        deliveryLogRepository.save(log2);

        Page<NotificationDeliveryLog> failedLogs = deliveryLogRepository.findByStatusOrderByCreatedAtDesc("FAILED", PageRequest.of(0, 10));
        assertEquals(1, failedLogs.getTotalElements());
        assertEquals("SMTP connection timeout", failedLogs.getContent().get(0).getErrorMessage());

        assertEquals(1, deliveryLogRepository.countByStatus("FAILED"));
        assertEquals(1, deliveryLogRepository.countByStatus("SENT"));
    }

    @Test
    public void testRetryDeliveryLog() {
        NotificationDeliveryLog log = new NotificationDeliveryLog();
        log.setRecipientId(recipient.getId());
        log.setRecipientEmail(recipient.getEmail());
        log.setChannel("EMAIL");
        log.setNotificationType("DISPUTE_CREATED");
        log.setSubject("[KemKendra] Commercial Dispute Raised");
        log.setStatus("FAILED");
        log.setErrorMessage("Connection refused");
        log.setRetryCount(0);
        log.setLastAttemptedAt(LocalDateTime.now());
        log = deliveryLogRepository.save(log);

        NotificationDeliveryLog retried = emailNotificationService.retryDeliveryLog(log.getId());
        assertNotNull(retried);
        assertEquals(1, retried.getRetryCount());
        // Since test environment mock email service doesn't fail, status should become RETRIED
        assertEquals("RETRIED", retried.getStatus());
        assertNull(retried.getErrorMessage());
    }
}
