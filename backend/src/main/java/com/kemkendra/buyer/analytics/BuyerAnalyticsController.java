package com.kemkendra.buyer.analytics;

import com.kemkendra.admin.analytics.AnalyticsExportService;
import com.kemkendra.buyer.analytics.dto.BuyerAnalyticsSummaryDto;
import com.kemkendra.identity.User;
import com.kemkendra.identity.UserRepository;
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
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/buyer/analytics")
@PreAuthorize("hasRole('USER') or hasRole('BUYER')")
public class BuyerAnalyticsController {

    private final BuyerAnalyticsService buyerAnalyticsService;
    private final AnalyticsExportService exportService;
    private final UserRepository userRepository;

    public BuyerAnalyticsController(BuyerAnalyticsService buyerAnalyticsService,
                                    AnalyticsExportService exportService,
                                    UserRepository userRepository) {
        this.buyerAnalyticsService = buyerAnalyticsService;
        this.exportService = exportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<BuyerAnalyticsSummaryDto> getSummary(
            @RequestParam(defaultValue = "30d") String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth
    ) {
        User user = resolveAuthenticatedUser(auth);
        return ResponseEntity.ok(buyerAnalyticsService.getBuyerAnalyticsSummary(user.getId(), period, from, to));
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
        User user = resolveAuthenticatedUser(auth);
        UUID buyerId = user.getId();

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
                csvData = exportService.exportRfqs(fromLdt, toLdt, null, buyerId, status);
                filename = "buyer_rfqs_" + startDate + "_to_" + endDate + ".csv";
            }
            case "orders" -> {
                csvData = exportService.exportOrders(fromLdt, toLdt, null, buyerId, status);
                filename = "buyer_orders_" + startDate + "_to_" + endDate + ".csv";
            }
            case "invoices" -> {
                csvData = exportService.exportInvoices(fromLdt, toLdt, null, buyerId, status);
                filename = "buyer_invoices_" + startDate + "_to_" + endDate + ".csv";
            }
            case "payments" -> {
                csvData = exportService.exportPayments(fromLdt, toLdt, null, buyerId, status);
                filename = "buyer_payments_" + startDate + "_to_" + endDate + ".csv";
            }
            default -> throw new IllegalArgumentException("Unsupported report type for buyer: " + reportType);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }

    private User resolveAuthenticatedUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found"));
    }
}
