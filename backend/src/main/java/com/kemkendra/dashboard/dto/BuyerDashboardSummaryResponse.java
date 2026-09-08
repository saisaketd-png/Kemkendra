package com.kemkendra.dashboard.dto;

import com.kemkendra.notification.dto.NotificationResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record BuyerDashboardSummaryResponse(
        UUID buyerId,
        String buyerName,
        String companyName,
        boolean isTaxProfileComplete,
        long totalRfqs,
        long activeRfqs,
        long quotationsReceived,
        long pendingQuotations,
        long acceptedQuotations,
        long totalOrders,
        long pendingOrders,
        long completedOrders,
        BigDecimal outstandingInvoiceAmount,
        BigDecimal paidInvoiceAmount,
        long openDisputes,
        List<NotificationResponse> recentNotifications,
        List<DashboardActivityItemDto> recentActivity,
        List<PendingActionDto> pendingActions
) {}
