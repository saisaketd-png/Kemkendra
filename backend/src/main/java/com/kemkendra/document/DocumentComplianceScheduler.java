package com.kemkendra.document;

import com.kemkendra.admin.audit.AuditAction;
import com.kemkendra.admin.audit.AuditService;
import com.kemkendra.admin.audit.AuditTargetType;
import com.kemkendra.notification.events.DocumentExpiredEvent;
import com.kemkendra.notification.events.DocumentNearingExpiryEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentComplianceScheduler {

    private static final Logger log = LoggerFactory.getLogger(DocumentComplianceScheduler.class);

    private final DocumentRepository documentRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final AuditService auditService;

    public DocumentComplianceScheduler(DocumentRepository documentRepository,
                                       ApplicationEventPublisher eventPublisher,
                                       AuditService auditService) {
        this.documentRepository = documentRepository;
        this.eventPublisher = eventPublisher;
        this.auditService = auditService;
    }

    /**
     * Daily compliance evaluation job running at 02:00 UTC.
     * Evaluates active approved documents for expiration and upcoming expiration warnings.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void processDailyComplianceExpirations() {
        log.info("Executing daily compliance document expiration job...");
        int expiredCount = processExpiredDocuments();
        int warningCount = processUpcomingExpirations();
        log.info("Completed daily compliance job: {} documents marked expired, {} expiration warnings dispatched.",
                expiredCount, warningCount);
    }

    @Transactional
    public int processExpiredDocuments() {
        LocalDate today = LocalDate.now();
        List<Document> expiredDocs = documentRepository.findByVerificationStatusAndExpiryDateBeforeAndIsActiveTrue(
                DocumentStatus.APPROVED.name(), today);

        int count = 0;
        for (Document doc : expiredDocs) {
            try {
                doc.setStatus(DocumentStatus.EXPIRED);
                doc.setIsActive(false);
                documentRepository.saveAndFlush(doc);

                auditService.recordInternal(
                        UUID.fromString("00000000-0000-0000-0000-000000000000"),
                        AuditAction.DOCUMENT_EXPIRED,
                        AuditTargetType.DOCUMENT,
                        doc.getId().toString(),
                        "System marked document expired (Expiry date: " + doc.getExpiryDate() + ")",
                        "127.0.0.1"
                );

                eventPublisher.publishEvent(new DocumentExpiredEvent(
                        doc.getId(),
                        doc.getOwnerId(),
                        doc.getOwnerType(),
                        doc.getCategory(),
                        doc.getUploadedBy()
                ));
                count++;
            } catch (Exception ex) {
                log.error("Failed to process expiration for document {}", doc.getId(), ex);
            }
        }
        return count;
    }

    @Transactional(readOnly = true)
    public int processUpcomingExpirations() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        List<Document> nearingExpiry = documentRepository.findByVerificationStatusAndExpiryDateBetweenAndIsActiveTrue(
                DocumentStatus.APPROVED.name(), today, in30Days);

        int count = 0;
        for (Document doc : nearingExpiry) {
            try {
                long daysRemaining = ChronoUnit.DAYS.between(today, doc.getExpiryDate());
                // Alert on exact thresholds: 30 days, 15 days, 7 days, 1 day
                if (daysRemaining == 30 || daysRemaining == 15 || daysRemaining == 7 || daysRemaining == 1) {
                    eventPublisher.publishEvent(new DocumentNearingExpiryEvent(
                            doc.getId(),
                            doc.getOwnerId(),
                            doc.getOwnerType(),
                            doc.getCategory(),
                            doc.getUploadedBy(),
                            daysRemaining
                    ));
                    count++;
                }
            } catch (Exception ex) {
                log.error("Failed to dispatch expiry warning for document {}", doc.getId(), ex);
            }
        }
        return count;
    }
}
