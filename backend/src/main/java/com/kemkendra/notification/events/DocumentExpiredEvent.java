package com.kemkendra.notification.events;

import com.kemkendra.document.DocumentCategory;
import com.kemkendra.document.DocumentOwnerType;

import java.util.UUID;

public record DocumentExpiredEvent(
        UUID documentId,
        UUID ownerId,
        DocumentOwnerType ownerType,
        DocumentCategory category,
        UUID uploadedBy
) {}
