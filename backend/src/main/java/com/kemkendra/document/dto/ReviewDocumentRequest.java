package com.kemkendra.document.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Size;

public class ReviewDocumentRequest {

    @JsonAlias({"notes", "reason"})
    @Size(max = 2000, message = "Review notes or rejection reason cannot exceed 2000 characters")
    private String reviewNotes;

    public ReviewDocumentRequest() {
    }

    public ReviewDocumentRequest(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}
