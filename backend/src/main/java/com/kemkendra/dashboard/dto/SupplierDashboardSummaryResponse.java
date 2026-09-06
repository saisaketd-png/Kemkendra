package com.kemkendra.dashboard.dto;

import com.kemkendra.notification.dto.NotificationResponse;

import java.math.BigDecimal;
import java.util.List;

public record SupplierDashboardSummaryResponse(
        Long supplierId,
        String supplierName,
        String verificationStatus,
        boolean isVerified,
        boolean isProfileComplete,
        long totalOfferings,
        long activeOfferings,
        long pendingReviewOfferings,
        long rfqsReceived,
        long pendingRfqs,
        long quotationsSubmitted,
        long acceptedQuotations,
        long totalOrders,
        long pendingOrders,
        long outstandingInvoices,
        BigDecimal outstandingInvoiceAmount,
        long confirmedPayments,
        BigDecimal confirmedPaymentAmount,
        long openDisputes,
        List<NotificationResponse> recentNotifications,
        List<DashboardActivityItemDto> recentActivity,
        List<PendingActionDto> pendingActions
) {}
