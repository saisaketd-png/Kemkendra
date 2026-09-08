package com.kemkendra.admin.analytics.dto;

import java.math.BigDecimal;
import java.util.Map;

public record InvoicePaymentReportDto(
        BigDecimal totalInvoiceValue,
        BigDecimal paidAmount,
        BigDecimal partiallyPaidAmount,
        BigDecimal outstandingAmount,
        BigDecimal overdueAmount,
        long cancelledInvoicesCount,
        BigDecimal cancelledInvoicesAmount,
        Map<String, Long> paymentConfirmationStatusBreakdown,
        long disputedPaymentsCount,
        BigDecimal disputedPaymentsAmount,
        String platformRevenueNotice
) {
}
