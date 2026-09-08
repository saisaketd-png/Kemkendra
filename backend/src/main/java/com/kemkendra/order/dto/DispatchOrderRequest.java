package com.kemkendra.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record DispatchOrderRequest(
        @NotBlank(message = "Tracking number is required")
        @Size(max = 100, message = "Tracking number must not exceed 100 characters")
        String trackingNumber,

        @Size(max = 100, message = "Carrier name must not exceed 100 characters")
        String carrier,

        LocalDateTime dispatchDate,

        LocalDate estimatedDeliveryDate,

        @Size(max = 2000, message = "Delivery notes must not exceed 2000 characters")
        String deliveryNotes
) {}
