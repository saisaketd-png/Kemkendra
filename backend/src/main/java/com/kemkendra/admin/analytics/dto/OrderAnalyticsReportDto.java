package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record OrderAnalyticsReportDto(
        List<DataPointDto> ordersOverTime,
        Map<String, Long> ordersByStatus,
        long totalOrders,
        long completedOrders,
        long cancelledOrders,
        BigDecimal averageOrderValue,
        double averageOrderCompletionTimeDays,
        List<TopProductDto> mostOrderedProducts,
        List<TopSupplierDto> mostActiveSuppliers
) {
}
