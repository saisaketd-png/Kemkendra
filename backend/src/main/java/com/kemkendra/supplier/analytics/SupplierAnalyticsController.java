package com.kemkendra.supplier.analytics;

import com.kemkendra.admin.analytics.AnalyticsExportService;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
import com.kemkendra.product.Supplier;
import com.kemkendra.seller.SupplierIdentityResolver;
import com.kemkendra.supplier.analytics.dto.SupplierAnalyticsSummaryDto;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/supplier/analytics")
@PreAuthorize("hasRole('SUPPLIER')")
public class SupplierAnalyticsController {

    private final SupplierAnalyticsService supplierAnalyticsService;
    private final AnalyticsExportService exportService;
    private final UserRepository userRepository;
    private final SupplierIdentityResolver identityResolver;

    public SupplierAnalyticsController(SupplierAnalyticsService supplierAnalyticsService,
                                       AnalyticsExportService exportService,
                                       UserRepository userRepository,
                                       SupplierIdentityResolver identityResolver) {
        this.supplierAnalyticsService = supplierAnalyticsService;
        this.exportService = exportService;
        this.userRepository = userRepository;
        this.identityResolver = identityResolver;
    }

    @GetMapping("/summary")
    public ResponseEntity<SupplierAnalyticsSummaryDto> getSummary(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth
    ) {
        Supplier supplier = resolveOperationalSupplier(auth);
        return ResponseEntity.ok(supplierAnalyticsService.getSupplierAnalyticsSummary(supplier.getId(), period, from, to));
    }

    @GetMapping("/export/{reportType}")
    public ResponseEntity<byte[]> exportReport(
            @PathVariable String reportType,
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String status,
            Authentication auth
    ) {
        Supplier supplier = resolveOperationalSupplier(auth);
        Long supplierId = supplier.getId();

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
                csvData = exportService.exportRfqs(fromLdt, toLdt, supplierId, null, status);
                filename = "supplier_rfqs_" + startDate + "_to_" + endDate + ".csv";
            }
            case "quotations" -> {
                csvData = exportService.exportQuotations(fromLdt, toLdt, supplierId, status);
                filename = "supplier_quotations_" + startDate + "_to_" + endDate + ".csv";
            }
            case "orders" -> {
                csvData = exportService.exportOrders(fromLdt, toLdt, supplierId, null, status);
                filename = "supplier_orders_" + startDate + "_to_" + endDate + ".csv";
            }
            case "invoices" -> {
                csvData = exportService.exportInvoices(fromLdt, toLdt, supplierId, null, status);
                filename = "supplier_invoices_" + startDate + "_to_" + endDate + ".csv";
            }
            case "payments" -> {
                csvData = exportService.exportPayments(fromLdt, toLdt, supplierId, null, status);
                filename = "supplier_payments_" + startDate + "_to_" + endDate + ".csv";
            }
            default -> throw new IllegalArgumentException("Unsupported report type for supplier: " + reportType);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    private Supplier resolveOperationalSupplier(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
        return identityResolver.resolveOperationalSupplier(user);
    }
}
