package com.kemkendra.admin.analytics;

import com.kemkendra.admin.analytics.dto.*;
import com.kemkendra.notification.Notification;
import com.kemkendra.notification.NotificationRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class AdminAnalyticsService {

    private final AdminAnalyticsRepository analyticsRepository;
    private final NotificationRepository notificationRepository;
    private final com.kemkendra.product.analytics.ProductAnalyticsEventRepository productAnalyticsEventRepository;

    public AdminAnalyticsService(AdminAnalyticsRepository analyticsRepository,
                                 NotificationRepository notificationRepository,
                                 com.kemkendra.product.analytics.ProductAnalyticsEventRepository productAnalyticsEventRepository) {
        this.analyticsRepository = analyticsRepository;
        this.notificationRepository = notificationRepository;
        this.productAnalyticsEventRepository = productAnalyticsEventRepository;
    }

    public AdminAnalyticsOverviewResponse getOverview(String period, String fromStr, String toStr) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        long periodDays;

        if ("7d".equalsIgnoreCase(period)) {
            periodDays = 7;
            startDate = endDate.minusDays(6);
        } else if ("90d".equalsIgnoreCase(period)) {
            periodDays = 90;
            startDate = endDate.minusDays(89);
        } else if ("12m".equalsIgnoreCase(period)) {
            periodDays = 365;
            startDate = endDate.minusDays(364);
        } else if ("custom".equalsIgnoreCase(period) || (fromStr != null && toStr != null)) {
            period = "custom";
            startDate = LocalDate.parse(fromStr, DateTimeFormatter.ISO_LOCAL_DATE);
            endDate = LocalDate.parse(toStr, DateTimeFormatter.ISO_LOCAL_DATE);
            if (startDate.isAfter(endDate)) {
                throw new IllegalArgumentException("Start date cannot be after end date");
            }
            periodDays = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        } else {
            // Default 30d
            period = "30d";
            periodDays = 30;
            startDate = endDate.minusDays(29);
        }

        LocalDate prevEndDate = startDate.minusDays(1);
        LocalDate prevStartDate = prevEndDate.minusDays(periodDays - 1);

        LocalDateTime currentStartLdt = startDate.atStartOfDay();
        LocalDateTime currentEndLdt = endDate.atTime(LocalTime.MAX);
        Instant currentStartInst = currentStartLdt.toInstant(ZoneOffset.UTC);
        Instant currentEndInst = currentEndLdt.toInstant(ZoneOffset.UTC);

        LocalDateTime prevStartLdt = prevStartDate.atStartOfDay();
        LocalDateTime prevEndLdt = prevEndDate.atTime(LocalTime.MAX);
        Instant prevStartInst = prevStartLdt.toInstant(ZoneOffset.UTC);
        Instant prevEndInst = prevEndLdt.toInstant(ZoneOffset.UTC);

        // 1. User Metrics
        long totalUsers = analyticsRepository.countTotalUsers();
        long totalBuyers = analyticsRepository.countUsersByRole("USER");
        long totalSuppliersInUsers = analyticsRepository.countUsersByRole("SUPPLIER");
        long activeUsers = analyticsRepository.countUsersByStatus("ACTIVE");
        long suspendedUsers = analyticsRepository.countUsersByStatus("SUSPENDED");
        long pendingUsers = analyticsRepository.countUsersByStatus("PENDING");
        long unverifiedUsers = analyticsRepository.countUnverifiedEmailUsers();
        long periodUserRegs = analyticsRepository.countUserRegistrationsBetween(currentStartInst, currentEndInst);
        long prevUserRegs = analyticsRepository.countUserRegistrationsBetween(prevStartInst, prevEndInst);
        Double userGrowth = calculateGrowthPercentage(periodUserRegs, prevUserRegs);

        UserAnalyticsDto usersDto = new UserAnalyticsDto(
                totalUsers,
                totalBuyers,
                totalSuppliersInUsers,
                activeUsers,
                suspendedUsers,
                pendingUsers,
                unverifiedUsers,
                periodUserRegs,
                prevUserRegs,
                userGrowth
        );

        // 2. Supplier Metrics
        long totalSuppliers = analyticsRepository.countTotalSuppliers();
        long pendingSuppliers = analyticsRepository.countSuppliersByVerificationStatus("PENDING");
        long underReviewSuppliers = analyticsRepository.countSuppliersByVerificationStatus("UNDER_REVIEW");
        long infoRequiredSuppliers = analyticsRepository.countSuppliersByVerificationStatus("INFORMATION_REQUIRED");
        long verifiedSuppliers = analyticsRepository.countSuppliersByVerificationStatus("VERIFIED");
        long rejectedSuppliers = analyticsRepository.countSuppliersByVerificationStatus("REJECTED");
        long suspendedSuppliers = analyticsRepository.countSuppliersByVerificationStatus("SUSPENDED");
        long draftSuppliers = analyticsRepository.countSuppliersByVerificationStatus("DRAFT");
        long periodSupplierRegs = analyticsRepository.countSupplierRegistrationsBetween(currentStartLdt, currentEndLdt);

        SupplierAnalyticsDto suppliersDto = new SupplierAnalyticsDto(
                totalSuppliers,
                pendingSuppliers,
                underReviewSuppliers,
                infoRequiredSuppliers,
                verifiedSuppliers,
                rejectedSuppliers,
                suspendedSuppliers,
                draftSuppliers,
                periodSupplierRegs
        );

        // 3. Marketplace (RFQ & Quotation) Metrics
        long totalRfqs = analyticsRepository.countTotalRfqs();
        long openRfqs = analyticsRepository.countOpenRfqs();
        long acceptedRfqs = analyticsRepository.countRfqsByStatus("ACCEPTED");
        long rejectedRfqs = analyticsRepository.countRfqsByStatus("REJECTED");
        long closedRfqs = analyticsRepository.countRfqsByStatus("CLOSED");
        long cancelledRfqs = analyticsRepository.countRfqsByStatus("CANCELLED");
        long periodRfqs = analyticsRepository.countRfqsBetween(currentStartLdt, currentEndLdt);

        long totalQuotations = analyticsRepository.countTotalQuotations();
        long periodQuotations = analyticsRepository.countQuotationsBetween(currentStartLdt, currentEndLdt);
        long acceptedQuotations = analyticsRepository.countAcceptedQuotations();
        long rejectedQuotations = analyticsRepository.countRfqsByStatus("REJECTED");

        MarketplaceAnalyticsDto marketplaceDto = new MarketplaceAnalyticsDto(
                totalRfqs,
                openRfqs,
                acceptedRfqs,
                rejectedRfqs,
                closedRfqs,
                cancelledRfqs,
                periodRfqs,
                totalQuotations,
                periodQuotations,
                acceptedQuotations,
                rejectedQuotations
        );

        // 4. Order Metrics
        long totalOrders = analyticsRepository.countTotalOrders();
        long periodOrders = analyticsRepository.countOrdersBetween(currentStartLdt, currentEndLdt);
        long placedOrders = analyticsRepository.countOrdersByStatus("PLACED");
        long confirmedOrders = analyticsRepository.countOrdersByStatus("CONFIRMED");
        long processingOrders = analyticsRepository.countOrdersByStatus("PROCESSING");
        long shippedOrders = analyticsRepository.countOrdersByStatus("SHIPPED");
        long deliveredOrders = analyticsRepository.countOrdersByStatus("DELIVERED");
        long completedOrders = analyticsRepository.countOrdersByStatus("COMPLETED");
        long cancelledOrders = analyticsRepository.countOrdersByStatus("CANCELLED");
        long rejectedOrders = analyticsRepository.countOrdersByStatus("REJECTED");

        OrderAnalyticsDto ordersDto = new OrderAnalyticsDto(
                totalOrders,
                periodOrders,
                placedOrders,
                confirmedOrders,
                processingOrders,
                shippedOrders,
                deliveredOrders,
                completedOrders,
                cancelledOrders,
                rejectedOrders
        );

        // 5. Commercial Metrics (GMV)
        BigDecimal totalGmv = analyticsRepository.sumTotalGmv().setScale(2, RoundingMode.HALF_UP);
        BigDecimal periodGmv = analyticsRepository.sumPeriodGmv(currentStartLdt, currentEndLdt).setScale(2, RoundingMode.HALF_UP);
        BigDecimal prevGmv = analyticsRepository.sumPeriodGmv(prevStartLdt, prevEndLdt).setScale(2, RoundingMode.HALF_UP);
        Double gmvGrowth = calculateGmvGrowthPercentage(periodGmv, prevGmv);
        BigDecimal averageOrderValue = analyticsRepository.averageOrderValue().setScale(2, RoundingMode.HALF_UP);

        Double rfqToQuoteConversion = calculateConversionRate(totalQuotations, totalRfqs);
        Double quoteToOrderConversion = calculateConversionRate(totalOrders, totalQuotations);
        Double rfqToOrderConversion = calculateConversionRate(totalOrders, totalRfqs);

        CommercialAnalyticsDto commercialDto = new CommercialAnalyticsDto(
                totalGmv,
                periodGmv,
                prevGmv,
                gmvGrowth,
                averageOrderValue,
                rfqToQuoteConversion,
                quoteToOrderConversion,
                rfqToOrderConversion
        );

        // 6. Shipment Metrics
        long totalShipments = analyticsRepository.countTotalShipments();
        long activeShipments = analyticsRepository.countActiveShipments();
        long deliveredShipments = analyticsRepository.countDeliveredShipments();
        long delayedShipments = analyticsRepository.countDelayedShipments();

        ShipmentAnalyticsDto shipmentsDto = new ShipmentAnalyticsDto(
                totalShipments,
                activeShipments,
                deliveredShipments,
                delayedShipments
        );

        // 7. Funnel Calculation
        MarketplaceFunnelDto funnelDto = buildMarketplaceFunnel(totalRfqs, totalQuotations, acceptedQuotations, totalOrders, completedOrders);

        // 8. Trends Calculation
        AnalyticsTrendsDto trendsDto = buildTrends(startDate, endDate, currentStartInst, currentEndInst, currentStartLdt, currentEndLdt);

        // 9. Operational Action Center Counters
        List<ActionCenterCounterDto> actionCenter = buildActionCenter(pendingSuppliers, suspendedUsers, openRfqs, activeShipments, delayedShipments);

        // 10. Recent Platform Activity
        List<RecentActivityDto> recentActivity = buildRecentActivity();

        return new AdminAnalyticsOverviewResponse(
                period,
                startDate.toString(),
                endDate.toString(),
                prevStartDate.toString(),
                prevEndDate.toString(),
                usersDto,
                suppliersDto,
                marketplaceDto,
                ordersDto,
                commercialDto,
                shipmentsDto,
                funnelDto,
                trendsDto,
                actionCenter,
                recentActivity
        );
    }

    private MarketplaceFunnelDto buildMarketplaceFunnel(long rfqs, long quotes, long accepted, long orders, long completed) {
        List<FunnelStageDto> stages = new ArrayList<>();

        double rfqConv = 100.0;
        stages.add(new FunnelStageDto("RFQS_CREATED", "RFQs Created", rfqs, rfqConv, 0.0));

        double quoteConv = calculateConversionRate(quotes, rfqs);
        double quoteDrop = Math.max(0.0, 100.0 - quoteConv);
        stages.add(new FunnelStageDto("QUOTATIONS_SUBMITTED", "Quotations Submitted", quotes, quoteConv, quoteDrop));

        double acceptConv = calculateConversionRate(accepted, quotes);
        double acceptDrop = Math.max(0.0, 100.0 - acceptConv);
        stages.add(new FunnelStageDto("QUOTATIONS_ACCEPTED", "Quotations Accepted", accepted, acceptConv, acceptDrop));

        double orderConv = calculateConversionRate(orders, accepted);
        double orderDrop = Math.max(0.0, 100.0 - orderConv);
        stages.add(new FunnelStageDto("ORDERS_PLACED", "Purchase Orders Placed", orders, orderConv, orderDrop));

        double compConv = calculateConversionRate(completed, orders);
        double compDrop = Math.max(0.0, 100.0 - compConv);
        stages.add(new FunnelStageDto("ORDERS_COMPLETED", "Orders Completed", completed, compConv, compDrop));

        double overallConversion = calculateConversionRate(completed, rfqs);

        return new MarketplaceFunnelDto(stages, overallConversion);
    }

    private AnalyticsTrendsDto buildTrends(LocalDate start, LocalDate end, Instant startInst, Instant endInst, LocalDateTime startLdt, LocalDateTime endLdt) {
        Map<LocalDate, Long> userTrendsMap = analyticsRepository.getUserRegistrationTrends(startInst, endInst);
        Map<LocalDate, Long> rfqTrendsMap = analyticsRepository.getRfqTrends(startLdt, endLdt);
        Map<LocalDate, Long> quoteTrendsMap = analyticsRepository.getQuotationTrends(startLdt, endLdt);
        Map<LocalDate, Long> orderTrendsMap = analyticsRepository.getOrderTrends(startLdt, endLdt);
        Map<LocalDate, BigDecimal> gmvTrendsMap = analyticsRepository.getGmvTrends(startLdt, endLdt);

        List<DataPointDto> userRegList = new ArrayList<>();
        List<DataPointDto> rfqList = new ArrayList<>();
        List<DataPointDto> quoteList = new ArrayList<>();
        List<DataPointDto> orderList = new ArrayList<>();
        List<DataPointDto> gmvList = new ArrayList<>();

        LocalDate cursor = start;
        while (!cursor.isAfter(end)) {
            String dateStr = cursor.toString();
            userRegList.add(new DataPointDto(dateStr, userTrendsMap.getOrDefault(cursor, 0L).doubleValue()));
            rfqList.add(new DataPointDto(dateStr, rfqTrendsMap.getOrDefault(cursor, 0L).doubleValue()));
            quoteList.add(new DataPointDto(dateStr, quoteTrendsMap.getOrDefault(cursor, 0L).doubleValue()));
            orderList.add(new DataPointDto(dateStr, orderTrendsMap.getOrDefault(cursor, 0L).doubleValue()));
            BigDecimal gmv = gmvTrendsMap.getOrDefault(cursor, BigDecimal.ZERO);
            gmvList.add(new DataPointDto(dateStr, gmv.doubleValue()));

            cursor = cursor.plusDays(1);
        }

        return new AnalyticsTrendsDto(userRegList, rfqList, quoteList, orderList, gmvList);
    }

    private List<ActionCenterCounterDto> buildActionCenter(long pendingSuppliers, long suspendedUsers, long openRfqs, long activeShipments, long delayedShipments) {
        List<ActionCenterCounterDto> list = new ArrayList<>();

        long pendingAppeals = analyticsRepository.countAppealsByStatus("SUBMITTED");
        long infoReqAppeals = analyticsRepository.countAppealsByStatus("INFORMATION_REQUIRED");

        if (pendingAppeals > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-appeal-pending",
                    "ACCOUNT_GOVERNANCE",
                    "HIGH",
                    "Pending Suspension Appeals",
                    "Formal account appeals awaiting initial administrative review",
                    pendingAppeals,
                    "/dashboard/admin/account-governance"
            ));
        }

        if (infoReqAppeals > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-appeal-info",
                    "ACCOUNT_GOVERNANCE",
                    "MEDIUM",
                    "Appeals Awaiting User Response",
                    "Appeals in information required status pending user submission",
                    infoReqAppeals,
                    "/dashboard/admin/account-governance"
            ));
        }

        if (pendingSuppliers > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-sup",
                    "SUPPLIER_VERIFICATION",
                    "HIGH",
                    "Suppliers Awaiting Verification",
                    "Supplier accounts pending compliance and credential review",
                    pendingSuppliers,
                    "/dashboard/admin/suppliers"
            ));
        }

        if (suspendedUsers > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-susp",
                    "USER_GOVERNANCE",
                    "MEDIUM",
                    "Suspended User Accounts",
                    "Users currently suspended from platform operations",
                    suspendedUsers,
                    "/dashboard/admin/account-governance"
            ));
        }

        if (openRfqs > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-rfq",
                    "MARKETPLACE_ACTIVITY",
                    "LOW",
                    "Active Open RFQs",
                    "Requests for quotation currently open for supplier bidding",
                    openRfqs,
                    "/dashboard/admin/transactions/rfqs"
            ));
        }

        if (delayedShipments > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-ship-delayed",
                    "OPERATIONS_LOGISTICS",
                    "HIGH",
                    "Delayed Active Shipments",
                    "Shipments past estimated delivery date requiring operational follow-up",
                    delayedShipments,
                    "/dashboard/admin/transactions/orders"
            ));
        } else if (activeShipments > 0) {
            list.add(new ActionCenterCounterDto(
                    "act-ship-active",
                    "OPERATIONS_LOGISTICS",
                    "LOW",
                    "Active In-Transit Shipments",
                    "Orders currently in processing or in transit",
                    activeShipments,
                    "/dashboard/admin/transactions/orders"
            ));
        }

        return list;
    }

    private List<RecentActivityDto> buildRecentActivity() {
        List<RecentActivityDto> list = new ArrayList<>();

        try {
            List<Notification> notifications = notificationRepository.findAll(
                    PageRequest.of(0, 15, Sort.by(Sort.Direction.DESC, "createdAt"))
            ).getContent();

            for (Notification n : notifications) {
                String link = resolveEntityLink(n.getEntityType() != null ? n.getEntityType().name() : null, n.getEntityId());
                list.add(new RecentActivityDto(
                        n.getId().toString(),
                        n.getType() != null ? n.getType().name() : "SYSTEM_EVENT",
                        n.getTitle(),
                        n.getMessage(),
                        n.getEntityType() != null ? n.getEntityType().name() : "NOTIFICATION",
                        n.getEntityId() != null ? n.getEntityId().toString() : null,
                        "System",
                        "PLATFORM",
                        n.getCreatedAt(),
                        link
                ));
            }
        } catch (Exception e) {
            // Graceful fallback if notifications table is empty
        }

        return list;
    }

    private String resolveEntityLink(String entityType, UUID entityId) {
        if (entityType == null || entityId == null) {
            return null;
        }
        return switch (entityType) {
            case "RFQ" -> "/dashboard/admin/transactions/rfqs";
            case "PURCHASE_ORDER", "ORDER" -> "/dashboard/admin/transactions/orders";
            case "SUPPLIER" -> "/dashboard/admin/suppliers";
            case "USER" -> "/dashboard/admin/users";
            case "ACCOUNT_SUSPENSION", "ACCOUNT_SUSPENSION_APPEAL" -> "/dashboard/admin/account-governance";
            default -> null;
        };
    }

    public static Double calculateGrowthPercentage(long current, long previous) {
        if (previous == 0) {
            return null;
        }
        double change = ((double) current - (double) previous) / (double) previous * 100.0;
        return Math.round(change * 10.0) / 10.0;
    }

    public static Double calculateGmvGrowthPercentage(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }
        BigDecimal diff = current.subtract(previous);
        BigDecimal pct = diff.divide(previous, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
        return pct.setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    public static Double calculateConversionRate(long numerator, long denominator) {
        if (denominator == 0) {
            return 0.0;
        }
        double rate = ((double) numerator / (double) denominator) * 100.0;
        return Math.round(rate * 10.0) / 10.0;
    }

    private LocalDate[] parseDateRange(String period, String fromStr, String toStr) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;

        if ("7d".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(6);
        } else if ("90d".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(89);
        } else if ("12m".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(364);
        } else if ("custom".equalsIgnoreCase(period) || (fromStr != null && toStr != null)) {
            try {
                startDate = LocalDate.parse(fromStr, DateTimeFormatter.ISO_LOCAL_DATE);
                endDate = LocalDate.parse(toStr, DateTimeFormatter.ISO_LOCAL_DATE);
                if (startDate.isAfter(endDate)) {
                    startDate = endDate.minusDays(29);
                }
            } catch (Exception e) {
                startDate = endDate.minusDays(29);
            }
        } else {
            startDate = endDate.minusDays(29);
        }
        return new LocalDate[]{startDate, endDate};
    }

    // ==========================================
    // 1. DASHBOARD 15-KPI OVERVIEW
    // ==========================================
    public AdminDashboardKpiDto getDashboardKpis() {
        return new AdminDashboardKpiDto(
                analyticsRepository.countTotalBuyers(),
                analyticsRepository.countTotalSuppliers(),
                analyticsRepository.countVerifiedSuppliers(),
                analyticsRepository.countActiveProducts(),
                analyticsRepository.countActiveOfferings(),
                analyticsRepository.countTotalRfqs(),
                analyticsRepository.countActiveRfqs(),
                analyticsRepository.countTotalQuotations(),
                analyticsRepository.countTotalOrders(),
                analyticsRepository.countCompletedOrders(),
                analyticsRepository.countCancelledOrders(),
                analyticsRepository.sumTotalInvoiceValue(),
                analyticsRepository.sumPaidInvoiceValue(),
                analyticsRepository.sumOutstandingInvoiceValue(),
                analyticsRepository.countOpenDisputes()
        );
    }

    // ==========================================
    // 2. RFQ & QUOTATION ANALYTICS
    // ==========================================
    public RfqQuotationAnalyticsDto getRfqQuotationAnalytics(String period, String fromStr, String toStr) {
        LocalDate[] range = parseDateRange(period, fromStr, toStr);
        LocalDateTime from = range[0].atStartOfDay();
        LocalDateTime to = range[1].atTime(LocalTime.MAX);

        Map<LocalDate, Long> rfqTrendMap = analyticsRepository.getRfqTrends(from, to);
        List<DataPointDto> trendList = new ArrayList<>();
        LocalDate cur = range[0];
        while (!cur.isAfter(range[1])) {
            trendList.add(new DataPointDto(cur.toString(), rfqTrendMap.getOrDefault(cur, 0L).doubleValue()));
            cur = cur.plusDays(1);
        }

        long totalRfqs = analyticsRepository.countRfqsBetween(from, to);
        long rfqsWithQuotes = analyticsRepository.countRfqsReceivingQuotationsBetween(from, to);
        long totalQuotes = analyticsRepository.countQuotationsBetween(from, to);
        long acceptedQuotes = analyticsRepository.countAcceptedQuotations();

        double avgQuotesPerRfq = rfqsWithQuotes > 0 ? Math.round(((double) totalQuotes / rfqsWithQuotes) * 10.0) / 10.0 : 0.0;
        double conversionRate = totalRfqs > 0 ? Math.round(((double) rfqsWithQuotes / totalRfqs * 100.0) * 10.0) / 10.0 : 0.0;
        double acceptanceRate = totalQuotes > 0 ? Math.round(((double) acceptedQuotes / totalQuotes * 100.0) * 10.0) / 10.0 : 0.0;
        double avgResponseHours = analyticsRepository.getAverageQuotationResponseTimeHoursBetween(from, to);

        return new RfqQuotationAnalyticsDto(
                trendList,
                totalRfqs,
                rfqsWithQuotes,
                avgQuotesPerRfq,
                conversionRate,
                acceptanceRate,
                avgResponseHours,
                analyticsRepository.countPendingRfqsBetween(from, to),
                analyticsRepository.countExpiredRfqsBetween(from, to)
        );
    }

    // ==========================================
    // 3. ORDER ANALYTICS
    // ==========================================
    public OrderAnalyticsReportDto getOrderAnalytics(String period, String fromStr, String toStr) {
        LocalDate[] range = parseDateRange(period, fromStr, toStr);
        LocalDateTime from = range[0].atStartOfDay();
        LocalDateTime to = range[1].atTime(LocalTime.MAX);

        Map<LocalDate, Long> orderTrendMap = analyticsRepository.getOrderTrends(from, to);
        List<DataPointDto> trendList = new ArrayList<>();
        LocalDate cur = range[0];
        while (!cur.isAfter(range[1])) {
            trendList.add(new DataPointDto(cur.toString(), orderTrendMap.getOrDefault(cur, 0L).doubleValue()));
            cur = cur.plusDays(1);
        }

        Map<String, Long> statusBreakdown = analyticsRepository.getOrderStatusBreakdownBetween(from, to);
        long totalOrders = analyticsRepository.countOrdersBetween(from, to);
        long completed = statusBreakdown.getOrDefault("COMPLETED", 0L) + statusBreakdown.getOrDefault("DELIVERED", 0L);
        long cancelled = statusBreakdown.getOrDefault("CANCELLED", 0L) + statusBreakdown.getOrDefault("REJECTED", 0L);

        BigDecimal aov = analyticsRepository.averageOrderValue();
        double avgCompletionDays = analyticsRepository.getAverageOrderCompletionTimeDaysBetween(from, to);
        List<TopProductDto> topProducts = analyticsRepository.getMostOrderedProductsBetween(from, to, 10);
        List<TopSupplierDto> topSuppliers = analyticsRepository.getMostActiveSuppliersBetween(from, to, 10);

        return new OrderAnalyticsReportDto(
                trendList,
                statusBreakdown,
                totalOrders,
                completed,
                cancelled,
                aov,
                avgCompletionDays,
                topProducts,
                topSuppliers
        );
    }

    // ==========================================
    // 4. SUPPLIER ANALYTICS
    // ==========================================
    public SupplierAnalyticsReportDto getSupplierAnalytics(String period, String fromStr, String toStr) {
        LocalDate[] range = parseDateRange(period, fromStr, toStr);
        LocalDateTime from = range[0].atStartOfDay();
        LocalDateTime to = range[1].atTime(LocalTime.MAX);

        long totalSuppliers = analyticsRepository.countTotalSuppliers();
        long verified = analyticsRepository.countSuppliersByVerificationStatus("VERIFIED");
        long pending = analyticsRepository.countSuppliersByVerificationStatus("PENDING");
        long underReview = analyticsRepository.countSuppliersByVerificationStatus("UNDER_REVIEW");
        long rejected = analyticsRepository.countSuppliersByVerificationStatus("REJECTED");

        long rfqsReceived = analyticsRepository.countRfqsBetween(from, to);
        long quotesSubmitted = analyticsRepository.countQuotationsBetween(from, to);
        long quotesAccepted = analyticsRepository.countAcceptedQuotations();
        long ordersCompleted = analyticsRepository.countCompletedOrders();
        double avgResponseHours = analyticsRepository.getAverageQuotationResponseTimeHoursBetween(from, to);

        List<SupplierPerformanceRowDto> performanceRows = analyticsRepository.getSupplierPerformanceSummaries(20);

        return new SupplierAnalyticsReportDto(
                totalSuppliers,
                verified,
                pending,
                underReview,
                rejected,
                rfqsReceived,
                quotesSubmitted,
                quotesAccepted,
                ordersCompleted,
                avgResponseHours,
                performanceRows
        );
    }

    // ==========================================
    // 5. PRODUCT ANALYTICS
    // ==========================================
    public ProductAnalyticsReportDto getProductAnalytics(String period, String fromStr, String toStr) {
        LocalDate[] range = parseDateRange(period, fromStr, toStr);
        LocalDateTime from = range[0].atStartOfDay();
        LocalDateTime to = range[1].atTime(LocalTime.MAX);

        long days = java.time.temporal.ChronoUnit.DAYS.between(range[0], range[1]) + 1;
        LocalDateTime prevFrom = from.minusDays(days);
        LocalDateTime prevTo = from.minusSeconds(1);

        // 1. Most searched
        List<SearchTermCountDto> mostSearched = new ArrayList<>();
        try {
            List<Object[]> searchResults = productAnalyticsEventRepository.findTopSearchesBetween(
                    from, to, PageRequest.of(0, 10));
            for (Object[] r : searchResults) {
                mostSearched.add(new SearchTermCountDto((String) r[0], ((Number) r[1]).longValue()));
            }
        } catch (Exception e) {
            // Safe fallback if table has no events yet
        }

        // 2. Most viewed
        List<ProductCountDto> mostViewed = new ArrayList<>();
        try {
            List<Object[]> viewResults = productAnalyticsEventRepository.findTopViewedProductsBetween(
                    from, to, PageRequest.of(0, 10));
            for (Object[] r : viewResults) {
                UUID pId = (UUID) r[0];
                mostViewed.add(new ProductCountDto(pId, "Chemical Product", "KP-" + pId.toString().substring(0, 6).toUpperCase(), ((Number) r[1]).longValue()));
            }
        } catch (Exception e) {
            // Safe fallback
        }

        // 3. Most requested chemicals
        List<ProductDemandDto> mostRequested = analyticsRepository.getMostRequestedChemicalsBetween(from, to, 10);

        // 4. Most active categories
        List<CategoryActivityDto> activeCategories = analyticsRepository.getCategoryActivityBetween(from, to);

        // 5. Products with no active offerings
        List<ProductSummaryDto> noOfferingProducts = analyticsRepository.getProductsWithNoActiveOfferings(10);

        // 6. Products with increasing demand
        List<ProductDemandGrowthDto> demandGrowth = analyticsRepository.getProductsWithIncreasingDemand(
                from, to, prevFrom, prevTo, 10);

        return new ProductAnalyticsReportDto(
                mostSearched,
                mostViewed,
                mostRequested,
                activeCategories,
                noOfferingProducts,
                demandGrowth
        );
    }

    // ==========================================
    // 6. INVOICE & PAYMENT REPORT
    // ==========================================
    public InvoicePaymentReportDto getInvoicePaymentReport(String period, String fromStr, String toStr) {
        LocalDate[] range = parseDateRange(period, fromStr, toStr);
        LocalDateTime from = range[0].atStartOfDay();
        LocalDateTime to = range[1].atTime(LocalTime.MAX);

        Map<String, Object> invoiceTotals = analyticsRepository.getInvoiceTotalsBetween(from, to);
        Map<String, Long> paymentBreakdown = analyticsRepository.getPaymentConfirmationStatusBreakdownBetween(from, to);
        Map<String, Object> disputes = analyticsRepository.getDisputedPaymentsBetween(from, to);

        BigDecimal totalVal = (BigDecimal) invoiceTotals.getOrDefault("total_val", BigDecimal.ZERO);
        BigDecimal paidVal = (BigDecimal) invoiceTotals.getOrDefault("paid_val", BigDecimal.ZERO);
        BigDecimal dueVal = (BigDecimal) invoiceTotals.getOrDefault("due_val", BigDecimal.ZERO);
        BigDecimal partPaidVal = (BigDecimal) invoiceTotals.getOrDefault("part_paid_val", BigDecimal.ZERO);
        BigDecimal overdueVal = (BigDecimal) invoiceTotals.getOrDefault("overdue_val", BigDecimal.ZERO);
        long cancelledCnt = (Long) invoiceTotals.getOrDefault("cancelled_cnt", 0L);
        BigDecimal cancelledAmt = (BigDecimal) invoiceTotals.getOrDefault("cancelled_amt", BigDecimal.ZERO);

        long disputeCnt = (Long) disputes.getOrDefault("count", 0L);
        BigDecimal disputeAmt = (BigDecimal) disputes.getOrDefault("amount", BigDecimal.ZERO);

        String notice = "KemKendra Marketplace Notice: Invoice and payment values represent gross transaction volume facilitated on the platform, not KemKendra direct company revenue.";

        return new InvoicePaymentReportDto(
                totalVal,
                paidVal,
                partPaidVal,
                dueVal,
                overdueVal,
                cancelledCnt,
                cancelledAmt,
                paymentBreakdown,
                disputeCnt,
                disputeAmt,
                notice
        );
    }
}
