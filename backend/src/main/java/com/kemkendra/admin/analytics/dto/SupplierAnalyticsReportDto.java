package com.kemkendra.admin.analytics.dto;

import java.util.List;

public record SupplierAnalyticsReportDto(
        long totalSuppliers,
        long verifiedSuppliers,
        long pendingSuppliers,
        long underReviewSuppliers,
        long rejectedSuppliers,
        long totalRfqsReceived,
        long totalQuotationsSubmitted,
        long totalQuotationsAccepted,
        long totalOrdersCompleted,
        double averageResponseTimeHours,
        List<SupplierPerformanceRowDto> supplierPerformanceList
) {
}
