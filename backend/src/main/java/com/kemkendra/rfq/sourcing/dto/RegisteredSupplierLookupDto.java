package com.kemkendra.rfq.sourcing.dto;

public record RegisteredSupplierLookupDto(
        Long id,
        String name,
        String legalName,
        String businessType,
        String businessEmail,
        String businessPhone,
        String contactPerson,
        String website,
        String location,
        Boolean verified,
        String verificationStatus,
        String primaryCategories
) {
}
