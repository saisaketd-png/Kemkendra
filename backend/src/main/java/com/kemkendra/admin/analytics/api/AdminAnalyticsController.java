package com.kemkendra.admin.analytics.api;

import com.kemkendra.admin.analytics.AdminAnalyticsService;
import com.kemkendra.admin.analytics.AnalyticsExportService;
import com.kemkendra.admin.analytics.dto.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final AdminAnalyticsService analyticsService;
    private final AnalyticsExportService exportService;

    public AdminAnalyticsController(AdminAnalyticsService analyticsService,
                                    AnalyticsExportService exportService) {
        this.analyticsService = analyticsService;
        this.exportService = exportService;
    }

    @GetMapping("/overview")
    public ResponseEntity<AdminAnalyticsOverviewResponse> getOverview(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getOverview(period, from, to));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardKpiDto> getDashboardKpis() {
        return ResponseEntity.ok(analyticsService.getDashboardKpis());
    }

    @GetMapping("/rfqs")
    public ResponseEntity<RfqQuotationAnalyticsDto> getRfqAnalytics(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getRfqQuotationAnalytics(period, from, to));
    }

    @GetMapping("/orders")
    public ResponseEntity<OrderAnalyticsReportDto> getOrderAnalytics(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getOrderAnalytics(period, from, to));
    }

    @GetMapping("/suppliers")
    public ResponseEntity<SupplierAnalyticsReportDto> getSupplierAnalytics(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getSupplierAnalytics(period, from, to));
    }

    @GetMapping("/products")
    public ResponseEntity<ProductAnalyticsReportDto> getProductAnalytics(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getProductAnalytics(period, from, to));
    }

    @GetMapping("/invoices")
    public ResponseEntity<InvoicePaymentReportDto> getInvoicePaymentReport(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        return ResponseEntity.ok(analyticsService.getInvoicePaymentReport(period, from, to));
    }

    @GetMapping("/export/{reportType}")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String reportType,
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) UUID buyerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category
    ) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate;
        if ("7d".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(6);
        } else if ("90d".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(89);
        } else if ("12m".equalsIgnoreCase(period)) {
            startDate = endDate.minusDays(364);
        } else if ("custom".equalsIgnoreCase(period) || (from != null && to != null)) {
            try {
                startDate = LocalDate.parse(from, DateTimeFormatter.ISO_LOCAL_DATE);
                endDate = LocalDate.parse(to, DateTimeFormatter.ISO_LOCAL_DATE);
            } catch (Exception e) {
                startDate = endDate.minusDays(29);
            }
        } else {
            startDate = endDate.minusDays(29);
        }

        LocalDateTime fromLdt = startDate.atStartOfDay();
        LocalDateTime toLdt = endDate.atTime(LocalTime.MAX);

        byte[] csvData;
        String filename;

        switch (reportType.toLowerCase()) {
            case "rfqs" -> {
                csvData = exportService.exportRfqs(fromLdt, toLdt, supplierId, buyerId, status);
                filename = "kemkendra_rfqs_report_" + startDate + "_to_" + endDate + ".csv";
            }
            case "quotations" -> {
                csvData = exportService.exportQuotations(fromLdt, toLdt, supplierId, status);
                filename = "kemkendra_quotations_report_" + startDate + "_to_" + endDate + ".csv";
            }
            case "orders" -> {
                csvData = exportService.exportOrders(fromLdt, toLdt, supplierId, buyerId, status);
                filename = "kemkendra_orders_report_" + startDate + "_to_" + endDate + ".csv";
            }
            case "suppliers" -> {
                csvData = exportService.exportSuppliers(status);
                filename = "kemkendra_suppliers_report_" + LocalDate.now() + ".csv";
            }
            case "products" -> {
                csvData = exportService.exportProducts(category);
                filename = "kemkendra_products_report_" + LocalDate.now() + ".csv";
            }
            case "invoices" -> {
                csvData = exportService.exportInvoices(fromLdt, toLdt, supplierId, buyerId, status);
                filename = "kemkendra_invoices_report_" + startDate + "_to_" + endDate + ".csv";
            }
            case "payments" -> {
                csvData = exportService.exportPayments(fromLdt, toLdt, supplierId, buyerId, status);
                filename = "kemkendra_payments_report_" + startDate + "_to_" + endDate + ".csv";
            }
            default -> throw new IllegalArgumentException("Unknown report type: " + reportType);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
