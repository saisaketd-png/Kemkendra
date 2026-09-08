package com.kemkendra.supplier.analytics;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import com.kemkendra.admin.analytics.dto.TopProductDto;
import com.kemkendra.supplier.analytics.dto.SupplierAnalyticsSummaryDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class SupplierAnalyticsService {

    private final SupplierAnalyticsRepository supplierAnalyticsRepository;

    public SupplierAnalyticsService(SupplierAnalyticsRepository supplierAnalyticsRepository) {
        this.supplierAnalyticsRepository = supplierAnalyticsRepository;
    }

    public SupplierAnalyticsSummaryDto getSupplierAnalyticsSummary(Long supplierId, String period, String fromStr, String toStr) {
        if (supplierId == null) {
            throw new IllegalArgumentException("Supplier ID cannot be null");
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

        long rfqsRec = supplierAnalyticsRepository.countRfqsReceived(supplierId);
        long activeRfqs = supplierAnalyticsRepository.countActiveRfqs(supplierId);
        long quotesSub = supplierAnalyticsRepository.countQuotationsSubmitted(supplierId);
        long quotesAcc = supplierAnalyticsRepository.countQuotationsAccepted(supplierId);
        double winRate = quotesSub > 0 ? Math.round(((double) quotesAcc / quotesSub * 100.0) * 10.0) / 10.0 : 0.0;
        double responseHours = supplierAnalyticsRepository.getAverageResponseTimeHours(supplierId);

        long ordersRec = supplierAnalyticsRepository.countOrdersReceived(supplierId);
        long ordersComp = supplierAnalyticsRepository.countOrdersCompleted(supplierId);
        BigDecimal fulfilledGmv = supplierAnalyticsRepository.sumFulfilledGmv(supplierId);
        BigDecimal receivables = supplierAnalyticsRepository.sumOutstandingReceivables(supplierId);

        List<DataPointDto> trends = supplierAnalyticsRepository.getFulfillmentTrends(supplierId, from, to);
        Map<String, Long> statusBreakdown = supplierAnalyticsRepository.getOrderStatusBreakdown(supplierId);
        List<TopProductDto> topSelling = supplierAnalyticsRepository.getTopSellingProducts(supplierId, 5);

        return new SupplierAnalyticsSummaryDto(
                rfqsRec,
                activeRfqs,
                quotesSub,
                quotesAcc,
                winRate,
                responseHours,
                ordersRec,
                ordersComp,
                fulfilledGmv,
                receivables,
                trends,
                statusBreakdown,
                topSelling
        );
    }
}
