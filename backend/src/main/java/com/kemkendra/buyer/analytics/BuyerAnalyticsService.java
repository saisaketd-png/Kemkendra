package com.kemkendra.buyer.analytics;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import com.kemkendra.admin.analytics.dto.TopProductDto;
import com.kemkendra.buyer.analytics.dto.BuyerAnalyticsSummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class BuyerAnalyticsService {

    private final BuyerAnalyticsRepository buyerAnalyticsRepository;

    public BuyerAnalyticsService(BuyerAnalyticsRepository buyerAnalyticsRepository) {
        this.buyerAnalyticsRepository = buyerAnalyticsRepository;
    }

    public BuyerAnalyticsSummaryDto getBuyerAnalyticsSummary(UUID buyerId, String period, String fromStr, String toStr) {
        if (buyerId == null) {
            throw new IllegalArgumentException("Buyer ID cannot be null");
        }

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
            } catch (Exception e) {
                startDate = endDate.minusDays(29);
            }
        } else {
            startDate = endDate.minusDays(29);
        }

        LocalDateTime from = startDate.atStartOfDay();
        LocalDateTime to = endDate.atTime(LocalTime.MAX);

        long totalRfqs = buyerAnalyticsRepository.countTotalRfqs(buyerId);
        long activeRfqs = buyerAnalyticsRepository.countActiveRfqs(buyerId);
        long quotesReceived = buyerAnalyticsRepository.countQuotationsReceived(buyerId);
        long ordersPlaced = buyerAnalyticsRepository.countOrdersPlaced(buyerId);
        long completedOrders = buyerAnalyticsRepository.countCompletedOrders(buyerId);
        BigDecimal totalSpent = buyerAnalyticsRepository.sumTotalSpent(buyerId);
        BigDecimal outstanding = buyerAnalyticsRepository.sumOutstandingInvoices(buyerId);
        double turnaround = buyerAnalyticsRepository.getAverageQuotationTurnaroundHours(buyerId);
        List<DataPointDto> spendTrends = buyerAnalyticsRepository.getSpendTrends(buyerId, from, to);
        Map<String, Long> statusBreakdown = buyerAnalyticsRepository.getOrderStatusBreakdown(buyerId);
        List<TopProductDto> topProducts = buyerAnalyticsRepository.getMostPurchasedProducts(buyerId, 5);

        return new BuyerAnalyticsSummaryDto(
                totalRfqs,
                activeRfqs,
                quotesReceived,
                ordersPlaced,
                completedOrders,
                totalSpent,
                outstanding,
                turnaround,
                spendTrends,
                statusBreakdown,
                topProducts
        );
    }
}
