package com.kemkendra.notification.events;

import java.util.UUID;

/**
 * Fired when a dispute is raised against a Purchase Order.
 */
public record OrderDisputedEvent(
        UUID purchaseOrderId,
        UUID disputeId,
        UUID buyerId,
        Long supplierId,
        String raisedByRole,
        String reason
) {}
