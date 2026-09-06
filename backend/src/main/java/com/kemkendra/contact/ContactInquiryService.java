package com.kemkendra.contact;

import com.kemkendra.contact.dto.ContactInquiryRequest;
import com.kemkendra.contact.dto.ContactInquiryResponse;
import com.kemkendra.notification.NotificationService;
import com.kemkendra.notification.NotificationType;
import com.kemkendra.product.analytics.ProductAnalyticsEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class ContactInquiryService {

    private static final Logger log = LoggerFactory.getLogger(ContactInquiryService.class);

    private final ContactInquiryRepository repository;
    private final NotificationService notificationService;
    private final ProductAnalyticsEventService analyticsEventService;

    public ContactInquiryService(ContactInquiryRepository repository,
                                 NotificationService notificationService,
                                 ProductAnalyticsEventService analyticsEventService) {
        this.repository = repository;
        this.notificationService = notificationService;
        this.analyticsEventService = analyticsEventService;
    }

    @Transactional
    public ContactInquiryResponse processInquiry(ContactInquiryRequest request, String clientIp) {
        // Honeypot spam defense: if honeypot field is filled, silently discard/accept without storing
        if (request.honeypot() != null && !request.honeypot().isBlank()) {
            log.info("Spam honeypot triggered by IP: {}", clientIp != null ? clientIp : "unknown");
            return new ContactInquiryResponse(
                    java.util.UUID.randomUUID(),
                    request.name(),
                    request.email(),
                    request.phone(),
                    request.companyName(),
                    request.chemicalInterest(),
                    request.casNumber(),
                    request.targetQuantity(),
                    request.message(),
                    "FILTERED",
                    java.time.Instant.now()
            );
        }

        String ipHash = hashIp(clientIp);

        ContactInquiry inquiry = new ContactInquiry(
                request.name().trim(),
                request.email().trim().toLowerCase(),
                request.phone() != null ? request.phone().trim() : null,
                request.companyName() != null ? request.companyName().trim() : null,
                request.chemicalInterest() != null ? request.chemicalInterest().trim() : null,
                request.casNumber() != null ? request.casNumber().trim() : null,
                request.targetQuantity() != null ? request.targetQuantity().trim() : null,
                request.message().trim(),
                ipHash
        );

        ContactInquiry saved = repository.save(inquiry);

        // Notify Admins
        try {
            String title = "New Inbound Chemical Inquiry: " + saved.getName();
            String chemicalPart = saved.getChemicalInterest() != null ? " for " + saved.getChemicalInterest() : "";
            String message = String.format("Inbound procurement inquiry received from %s (%s)%s: %s",
                    saved.getName(), saved.getEmail(), chemicalPart,
                    saved.getMessage().length() > 150 ? saved.getMessage().substring(0, 147) + "..." : saved.getMessage());

            notificationService.notifyAdmins(
                    NotificationType.SYSTEM_ANNOUNCEMENT,
                    title,
                    message,
                    null,
                    saved.getId()
            );
        } catch (Exception e) {
            log.warn("Failed to notify admins of contact inquiry: {}", e.getMessage());
        }

        // Track conversion event
        try {
            analyticsEventService.recordContactSubmitted();
        } catch (Exception e) {
            log.warn("Failed to record contact analytics event: {}", e.getMessage());
        }

        return new ContactInquiryResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getCompanyName(),
                saved.getChemicalInterest(),
                saved.getCasNumber(),
                saved.getTargetQuantity(),
                saved.getMessage(),
                saved.getStatus(),
                saved.getCreatedAt()
        );
    }

    private String hashIp(String ip) {
        if (ip == null || ip.isBlank()) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(ip.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return null;
        }
    }
}
