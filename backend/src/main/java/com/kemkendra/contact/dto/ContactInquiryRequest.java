package com.kemkendra.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactInquiryRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 150, message = "Name cannot exceed 150 characters")
        String name,

        @NotBlank(message = "Email is required")
        @Email(message = "Valid email address is required")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        String email,

        @Size(max = 50, message = "Phone cannot exceed 50 characters")
        String phone,

        @Size(max = 255, message = "Company name cannot exceed 255 characters")
        String companyName,

        @Size(max = 255, message = "Chemical interest cannot exceed 255 characters")
        String chemicalInterest,

        @Size(max = 50, message = "CAS number cannot exceed 50 characters")
        String casNumber,

        @Size(max = 100, message = "Target quantity cannot exceed 100 characters")
        String targetQuantity,

        @NotBlank(message = "Message is required")
        @Size(max = 5000, message = "Message cannot exceed 5000 characters")
        String message,

        // Honeypot field for anti-bot defense - must be empty
        String honeypot
) {
}
