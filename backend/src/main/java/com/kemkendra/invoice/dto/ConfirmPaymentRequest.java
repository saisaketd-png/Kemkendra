package com.kemkendra.invoice.dto;

public class ConfirmPaymentRequest {
    private String reviewNotes;

    public ConfirmPaymentRequest() {}
    public ConfirmPaymentRequest(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
}
