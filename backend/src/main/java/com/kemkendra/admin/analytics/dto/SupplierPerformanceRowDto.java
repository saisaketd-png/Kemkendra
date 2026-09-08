package com.kemkendra.admin.analytics.dto;

public record SupplierPerformanceRowDto(
        Long supplierId,
        String supplierName,
        String verificationStatus,
        long rfqsReceived,
        long quotationsSubmitted,
        long quotationsAccepted,
        long ordersCompleted,
        double quoteAcceptanceRate,
        double averageResponseTimeHours
) {
}
