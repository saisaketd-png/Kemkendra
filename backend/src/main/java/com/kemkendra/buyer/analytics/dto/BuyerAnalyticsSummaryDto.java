package com.kemkendra.buyer.analytics.dto;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import com.kemkendra.admin.analytics.dto.TopProductDto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record BuyerAnalyticsSummaryDto(
        long totalRfqs,
        long activeRfqs,
        long quotationsReceived,
        long ordersPlaced,
        long completedOrders,
        BigDecimal totalSpent,
        BigDecimal outstandingInvoicesAmount,
        double averageQuotationTurnaroundHours,
        List<DataPointDto> spendTrends,
        Map<String, Long> ordersByStatus,
        List<TopProductDto> mostPurchasedProducts
) {
}
