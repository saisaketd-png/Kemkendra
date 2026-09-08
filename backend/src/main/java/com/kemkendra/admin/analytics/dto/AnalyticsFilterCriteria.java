package com.kemkendra.admin.analytics.dto;

import java.time.LocalDate;
import java.util.UUID;

public record AnalyticsFilterCriteria(
        String period,
        LocalDate fromDate,
        LocalDate toDate,
        Long supplierId,
        UUID buyerId,
        UUID masterProductId,
        String category,
        String rfqStatus,
        String orderStatus,
        String invoiceStatus,
        String paymentStatus
) {
}
