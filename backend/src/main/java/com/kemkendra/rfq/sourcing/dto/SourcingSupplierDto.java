package com.kemkendra.rfq.sourcing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SourcingSupplierDto(
        UUID id,
        UUID sourcingRequestId,
        Long supplierId,
        String supplierName,
        String contactPerson,
        String contactEmail,
        String contactPhone,
        String website,
        String location,
        String supplierType,
        String productsSupplied,
        String verificationStatus,
        String status,
        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public SourcingSupplierDto(
            UUID id,
            UUID sourcingRequestId,
            Long supplierId,
            String supplierName,
            String contactPerson,
            String contactEmail,
            String contactPhone,
            String location,
            String status,
            String notes,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this(
                id,
                sourcingRequestId,
                supplierId,
                supplierName,
                contactPerson,
                contactEmail,
                contactPhone,
                null,
                location,
                "MANUFACTURER",
                null,
                "UNVERIFIED",
                status,
                notes,
                createdAt,
                updatedAt
        );
    }
}
