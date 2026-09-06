package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;

public record AdminDashboardKpiDto(
        long totalBuyers,
        long totalSuppliers,
        long verifiedSuppliers,
        long totalProducts,
        long activeCommercialOfferings,
        long totalRfqs,
        long activeRfqs,
        long totalQuotations,
        long totalOrders,
        long completedOrders,
        long cancelledOrders,
        BigDecimal totalInvoiceValue,
        BigDecimal paidInvoiceValue,
        BigDecimal outstandingInvoiceValue,
        long openDisputes
) {
}
