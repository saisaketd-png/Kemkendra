package com.kemkendra.admin.analytics.dto;

import java.util.List;

public record RfqQuotationAnalyticsDto(
        List<DataPointDto> rfqsOverTime,
        long totalRfqs,
        long rfqsReceivingQuotations,
        double averageQuotationsPerRfq,
        double rfqToQuotationConversionRate,
        double quotationAcceptanceRate,
        double averageQuotationResponseTimeHours,
        long pendingRfqs,
        long expiredRfqs
) {
}
