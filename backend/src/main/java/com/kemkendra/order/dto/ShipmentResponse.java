package com.kemkendra.order.dto;

import com.kemkendra.order.ShipmentStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record ShipmentResponse(
        UUID id,
        String carrier,
        String trackingNumber,
        ShipmentStatus shipmentStatus,
        LocalDateTime dispatchDate,
        LocalDate estimatedDeliveryDate,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt,
        String deliveryNotes
) {
    public ShipmentResponse(UUID id, String carrier, String trackingNumber, LocalDate estimatedDeliveryDate, LocalDateTime shippedAt) {
        this(id, carrier, trackingNumber, ShipmentStatus.DISPATCHED, shippedAt, estimatedDeliveryDate, shippedAt, null, null);
    }
}
