package com.kemkendra.contact.dto;

import java.time.Instant;
import java.util.UUID;

public record ContactInquiryResponse(
        UUID id,
        String name,
        String email,
        String phone,
        String companyName,
        String chemicalInterest,
        String casNumber,
        String targetQuantity,
        String message,
        String status,
        Instant createdAt
) {
}
