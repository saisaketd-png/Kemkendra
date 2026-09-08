package com.kemkendra.notification.events;

import java.util.UUID;

/**
 * Fired when shipment status is updated (e.g. IN_TRANSIT, DELIVERED).
 * Recipient: the buyer who issued the PO.
 */
public record ShipmentStatusUpdatedEvent(
        UUID purchaseOrderId,
        UUID buyerId,
        Long supplierId,
        String shipmentStatus,
        String carrier,
        String trackingNumber
) {}
