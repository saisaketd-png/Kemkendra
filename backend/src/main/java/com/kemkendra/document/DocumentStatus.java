package com.kemkendra.document;

public enum DocumentStatus {
    PENDING_REVIEW,
    APPROVED,
    REJECTED,
    EXPIRED,
    REPLACED,
    ARCHIVED;

    public static DocumentStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return PENDING_REVIEW;
        }
        String normalized = value.trim().toUpperCase();
        try {
            return DocumentStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // Handle legacy status values
            if ("ACTIVE".equals(normalized) || "VERIFIED".equals(normalized)) {
                return APPROVED;
            }
            if ("INACTIVE".equals(normalized)) {
                return ARCHIVED;
            }
            return PENDING_REVIEW;
        }
    }
}
