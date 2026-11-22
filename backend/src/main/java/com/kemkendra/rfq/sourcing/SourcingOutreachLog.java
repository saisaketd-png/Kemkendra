package com.kemkendra.rfq.sourcing;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sourcing_outreach_logs")
public class SourcingOutreachLog {

    @Id
    private UUID id;

    @Column(name = "sourcing_request_id", nullable = false)
    private UUID sourcingRequestId;

    @Column(name = "sourcing_supplier_id")
    private UUID sourcingSupplierId;

    @Column(name = "outreach_channel", nullable = false, length = 50)
    private String outreachChannel;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "performed_by_user_id", nullable = false)
    private UUID performedByUserId;

    @Column(name = "contact_date")
    private LocalDateTime contactDate;

    @Column(name = "response_status", length = 50)
    private String responseStatus;

    @Column(name = "next_follow_up_date")
    private LocalDateTime nextFollowUpDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 255)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    @Column(length = 100)
    private String outcome;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (loggedAt == null) {
            loggedAt = LocalDateTime.now();
        }
        if (contactDate == null) {
            contactDate = loggedAt;
        }
        if (responseStatus == null) {
            responseStatus = "PENDING";
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSourcingRequestId() {
        return sourcingRequestId;
    }

    public void setSourcingRequestId(UUID sourcingRequestId) {
        this.sourcingRequestId = sourcingRequestId;
    }

    public UUID getSourcingSupplierId() {
        return sourcingSupplierId;
    }

    public void setSourcingSupplierId(UUID sourcingSupplierId) {
        this.sourcingSupplierId = sourcingSupplierId;
    }

    public String getOutreachChannel() {
        return outreachChannel;
    }

    public void setOutreachChannel(String outreachChannel) {
        this.outreachChannel = outreachChannel;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public UUID getPerformedByUserId() {
        return performedByUserId;
    }

    public void setPerformedByUserId(UUID performedByUserId) {
        this.performedByUserId = performedByUserId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getOutcome() {
        return outcome;
    }

    public void setOutcome(String outcome) {
        this.outcome = outcome;
    }

    public LocalDateTime getContactDate() {
        return contactDate;
    }

    public void setContactDate(LocalDateTime contactDate) {
        this.contactDate = contactDate;
    }

    public String getResponseStatus() {
        return responseStatus;
    }

    public void setResponseStatus(String responseStatus) {
        this.responseStatus = responseStatus;
    }

    public LocalDateTime getNextFollowUpDate() {
        return nextFollowUpDate;
    }

    public void setNextFollowUpDate(LocalDateTime nextFollowUpDate) {
        this.nextFollowUpDate = nextFollowUpDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(LocalDateTime loggedAt) {
        this.loggedAt = loggedAt;
    }
}
