package com.kemkendra.rfq.sourcing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddSourcingSupplierDto(
        Long supplierId, // nullable, if linked to registered supplier profile

        @NotBlank(message = "Company or supplier name is required")
        @Size(max = 255, message = "Supplier name cannot exceed 255 characters")
        String supplierName,

        @Size(max = 150, message = "Contact person name cannot exceed 150 characters")
        String contactPerson,

        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String contactEmail,

        @Size(max = 50, message = "Phone number cannot exceed 50 characters")
        String contactPhone,

        @Size(max = 255, message = "Website cannot exceed 255 characters")
        String website,

        @Size(max = 255, message = "Location cannot exceed 255 characters")
        String location,

        String supplierType, // MANUFACTURER, DISTRIBUTOR, TRADER

        String productsSupplied,

        String verificationStatus, // UNVERIFIED, VERIFIED, PENDING

        String notes
) {
}
