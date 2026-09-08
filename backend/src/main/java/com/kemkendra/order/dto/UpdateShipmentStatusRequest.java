package com.kemkendra.order.dto;

import com.kemkendra.order.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateShipmentStatusRequest(
        @NotNull(message = "Shipment status is required")
        ShipmentStatus shipmentStatus,

        @Size(max = 100, message = "Carrier name must not exceed 100 characters")
        String carrier,

        @Size(max = 100, message = "Tracking number must not exceed 100 characters")
        String trackingNumber,

        LocalDate estimatedDeliveryDate,

        @Size(max = 2000, message = "Delivery notes must not exceed 2000 characters")
        String deliveryNotes
) {}
