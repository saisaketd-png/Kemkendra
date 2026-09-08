package com.kemkendra.notification.events;

import com.kemkendra.document.DocumentCategory;
import com.kemkendra.document.DocumentOwnerType;

import java.util.UUID;

public record DocumentApprovedEvent(
        UUID documentId,
        UUID ownerId,
        DocumentOwnerType ownerType,
        DocumentCategory category,
        UUID uploadedBy,
        UUID reviewedBy,
        String reviewNotes
) {}
