package com.kemkendra.notification.events;

import java.util.UUID;

/**
 * Fired after a supplier marks a Purchase Order ready for dispatch.
 * Recipient: the buyer who issued the PO.
 */
public record OrderReadyForDispatchEvent(
        UUID purchaseOrderId,
        UUID buyerId,
        Long supplierId
) {}
