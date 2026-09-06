package com.kemkendra.supplier.analytics.dto;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import com.kemkendra.admin.analytics.dto.TopProductDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record SupplierAnalyticsSummaryDto(
        long rfqsReceived,
        long activeRfqs,
        long quotationsSubmitted,
        long quotationsAccepted,
        double quotationAcceptanceRate,
        double averageResponseTimeHours,
        long ordersReceived,
        long ordersCompleted,
        BigDecimal totalFulfilledGmv,
        BigDecimal outstandingReceivablesAmount,
        List<DataPointDto> fulfillmentTrends,
        Map<String, Long> ordersByStatus,
        List<TopProductDto> topSellingProducts
) {
}
