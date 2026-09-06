package com.kemkendra.admin.analytics;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class AdminAnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public AdminAnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ==========================================
    // USER METRICS
    // ==========================================

    public long countTotalUsers() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL", Long.class);
        return count != null ? count : 0L;
    }

    public long countUsersByRole(String role) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = ? AND deleted_at IS NULL",
                Long.class,
                role
        );
        return count != null ? count : 0L;
    }

    public long countUsersByStatus(String status) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE status = ? AND deleted_at IS NULL",
                Long.class,
                status
        );
        return count != null ? count : 0L;
    }

    public long countUnverifiedEmailUsers() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE email_verified_at IS NULL AND deleted_at IS NULL",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countUserRegistrationsBetween(Instant from, Instant to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE created_at >= ? AND created_at < ? AND deleted_at IS NULL",
                Long.class,
                Timestamp.from(from),
                Timestamp.from(to)
        );
        return count != null ? count : 0L;
    }

    // ==========================================
    // SUPPLIER METRICS
    // ==========================================

    public long countTotalSuppliers() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM suppliers", Long.class);
        return count != null ? count : 0L;
    }

    public long countSuppliersByVerificationStatus(String status) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM suppliers WHERE verification_status = ?",
                Long.class,
                status
        );
        return count != null ? count : 0L;
    }

    public long countSupplierRegistrationsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM suppliers WHERE created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    // ==========================================
    // RFQ METRICS
    // ==========================================

    public long countTotalRfqs() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rfqs", Long.class);
        return count != null ? count : 0L;
    }

    public long countOpenRfqs() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE status IN ('PENDING', 'CONTACTED', 'QUOTED', 'COUNTERED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countRfqsByStatus(String status) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE status = ?",
                Long.class,
                status
        );
        return count != null ? count : 0L;
    }

    public long countRfqsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    // ==========================================
    // QUOTATION METRICS
    // ==========================================

    public long countTotalQuotations() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM quotations", Long.class);
        return count != null ? count : 0L;
    }

    public long countQuotationsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM quotations WHERE created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    public long countAcceptedQuotations() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT accepted_quotation_id) FROM rfqs WHERE accepted_quotation_id IS NOT NULL",
                Long.class
        );
        return count != null ? count : 0L;
    }

    // ==========================================
    // ORDER METRICS & GMV
    // ==========================================

    public long countTotalOrders() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM purchase_orders", Long.class);
        return count != null ? count : 0L;
    }

    public long countOrdersBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    public long countOrdersByStatus(String status) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE status = ?",
                Long.class,
                status
        );
        return count != null ? count : 0L;
    }

    public BigDecimal sumTotalGmv() {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE status NOT IN ('CANCELLED', 'REJECTED')",
                BigDecimal.class
        );
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumPeriodGmv(LocalDateTime from, LocalDateTime to) {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE created_at >= ? AND created_at < ? AND status NOT IN ('CANCELLED', 'REJECTED')",
                BigDecimal.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal averageOrderValue() {
        BigDecimal avg = jdbcTemplate.queryForObject(
                "SELECT COALESCE(AVG(total_amount), 0) FROM purchase_orders WHERE status NOT IN ('CANCELLED', 'REJECTED')",
                BigDecimal.class
        );
        return avg != null ? avg.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    // ==========================================
    // SHIPMENT METRICS
    // ==========================================

    public long countTotalShipments() {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM shipments", Long.class);
        return count != null ? count : 0L;
    }

    public long countActiveShipments() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM shipments s JOIN purchase_orders p ON s.purchase_order_id = p.id WHERE p.status IN ('SHIPPED', 'PROCESSING', 'PLACED', 'CONFIRMED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countDeliveredShipments() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM shipments s JOIN purchase_orders p ON s.purchase_order_id = p.id WHERE p.status IN ('DELIVERED', 'COMPLETED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countDelayedShipments() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM shipments s JOIN purchase_orders p ON s.purchase_order_id = p.id WHERE p.status IN ('SHIPPED', 'PROCESSING', 'PLACED', 'CONFIRMED') AND s.estimated_delivery_date < CURRENT_DATE",
                Long.class
        );
        return count != null ? count : 0L;
    }

    // ==========================================
    // TREND AGGREGATION
    // ==========================================

    public Map<LocalDate, Long> getUserRegistrationTrends(Instant from, Instant to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COUNT(*) as cnt FROM users " +
                "WHERE created_at >= ? AND created_at < ? AND deleted_at IS NULL GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, Long> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.from(from));
            ps.setTimestamp(2, Timestamp.from(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                map.put(d.toLocalDate(), rs.getLong("cnt"));
            }
        });
        return map;
    }

    public Map<LocalDate, Long> getRfqTrends(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COUNT(*) as cnt FROM rfqs " +
                "WHERE created_at >= ? AND created_at < ? GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, Long> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                map.put(d.toLocalDate(), rs.getLong("cnt"));
            }
        });
        return map;
    }

    public Map<LocalDate, Long> getQuotationTrends(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COUNT(*) as cnt FROM quotations " +
                "WHERE created_at >= ? AND created_at < ? GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, Long> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                map.put(d.toLocalDate(), rs.getLong("cnt"));
            }
        });
        return map;
    }

    public Map<LocalDate, Long> getOrderTrends(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COUNT(*) as cnt FROM purchase_orders " +
                "WHERE created_at >= ? AND created_at < ? GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, Long> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                map.put(d.toLocalDate(), rs.getLong("cnt"));
            }
        });
        return map;
    }

    public Map<LocalDate, BigDecimal> getGmvTrends(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COALESCE(SUM(total_amount), 0) as amt FROM purchase_orders " +
                "WHERE created_at >= ? AND created_at < ? AND status NOT IN ('CANCELLED', 'REJECTED') GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, BigDecimal> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                map.put(d.toLocalDate(), rs.getBigDecimal("amt"));
            }
        });
        return map;
    }

    // ==========================================
    // ACCOUNT GOVERNANCE & SUSPENSION METRICS
    // ==========================================

    public long countTotalSuspensions() {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM account_suspensions", Long.class);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countActiveSuspensions() {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM account_suspensions WHERE reinstated_at IS NULL", Long.class);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countSuspensionsBetween(Instant from, Instant to) {
        try {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM account_suspensions WHERE suspended_at >= ? AND suspended_at < ?",
                    Long.class,
                    Timestamp.from(from),
                    Timestamp.from(to)
            );
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countAppealsByStatus(String status) {
        try {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM account_suspension_appeals WHERE status = ?",
                    Long.class,
                    status
            );
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countActiveAppeals() {
        try {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM account_suspension_appeals WHERE status IN ('SUBMITTED', 'UNDER_REVIEW', 'INFORMATION_REQUIRED')",
                    Long.class
            );
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countAppealsBetween(Instant from, Instant to) {
        try {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM account_suspension_appeals WHERE created_at >= ? AND created_at < ?",
                    Long.class,
                    Timestamp.from(from),
                    Timestamp.from(to)
            );
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    public long countTotalReinstatements() {
        try {
            Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM account_suspensions WHERE reinstated_at IS NOT NULL", Long.class);
            return count != null ? count : 0L;
        } catch (Exception e) {
            return 0L;
        }
    }

    // ==========================================
    // EXTENDED DASHBOARD & REPORTING METRICS
    // ==========================================

    public long countTotalBuyers() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE role = 'USER' AND deleted_at IS NULL",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countVerifiedSuppliers() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM suppliers WHERE verification_status = 'VERIFIED'",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countActiveProducts() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM master_products WHERE deactivated_at IS NULL AND status = 'ACTIVE'",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countActiveOfferings() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM supplier_offerings WHERE availability_status = 'AVAILABLE' AND moderation_status = 'APPROVED'",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countActiveRfqs() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE status IN ('PENDING', 'CONTACTED', 'QUOTED', 'COUNTERED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countCompletedOrders() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE status IN ('COMPLETED', 'DELIVERED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countCancelledOrders() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE status IN ('CANCELLED', 'REJECTED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public BigDecimal sumTotalInvoiceValue() {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(grand_total), 0) FROM invoices WHERE status != 'CANCELLED'",
                BigDecimal.class
        );
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumPaidInvoiceValue() {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount_paid), 0) FROM invoices WHERE status != 'CANCELLED'",
                BigDecimal.class
        );
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumOutstandingInvoiceValue() {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount_due), 0) FROM invoices WHERE status NOT IN ('CANCELLED', 'PAID')",
                BigDecimal.class
        );
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public long countOpenDisputes() {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM disputes WHERE status IN ('OPEN', 'UNDER_REVIEW', 'ESCALATED')",
                Long.class
        );
        return count != null ? count : 0L;
    }

    public long countRfqsReceivingQuotationsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT rfq_id) FROM quotations WHERE created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    public long countPendingRfqsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE status = 'PENDING' AND created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    public long countExpiredRfqsBetween(LocalDateTime from, LocalDateTime to) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE status = 'EXPIRED' AND created_at >= ? AND created_at < ?",
                Long.class,
                Timestamp.valueOf(from),
                Timestamp.valueOf(to)
        );
        return count != null ? count : 0L;
    }

    public double getAverageQuotationResponseTimeHoursBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT r.created_at as rfq_time, MIN(q.created_at) as quote_time " +
                "FROM quotations q JOIN rfqs r ON q.rfq_id = r.id " +
                "WHERE q.created_at >= ? AND q.created_at < ? " +
                "GROUP BY r.id, r.created_at";

        List<Long> durationsSeconds = new ArrayList<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            Timestamp rfqTs = rs.getTimestamp("rfq_time");
            Timestamp quoteTs = rs.getTimestamp("quote_time");
            if (rfqTs != null && quoteTs != null) {
                long diff = (quoteTs.getTime() - rfqTs.getTime()) / 1000L;
                if (diff >= 0) {
                    durationsSeconds.add(diff);
                }
            }
        });

        if (durationsSeconds.isEmpty()) {
            return 0.0;
        }
        double avgSecs = durationsSeconds.stream().mapToLong(Long::longValue).average().orElse(0.0);
        return Math.round((avgSecs / 3600.0) * 10.0) / 10.0;
    }

    public Map<String, Long> getOrderStatusBreakdownBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT status, COUNT(*) as cnt FROM purchase_orders " +
                "WHERE created_at >= ? AND created_at < ? GROUP BY status";

        Map<String, Long> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            map.put(rs.getString("status"), rs.getLong("cnt"));
        });
        return map;
    }

    public double getAverageOrderCompletionTimeDaysBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT created_at, COALESCE(completed_at, delivered_at) as finish_time " +
                "FROM purchase_orders WHERE (completed_at IS NOT NULL OR delivered_at IS NOT NULL) " +
                "AND created_at >= ? AND created_at < ?";

        List<Long> durationsSeconds = new ArrayList<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            Timestamp startTs = rs.getTimestamp("created_at");
            Timestamp endTs = rs.getTimestamp("finish_time");
            if (startTs != null && endTs != null) {
                long diff = (endTs.getTime() - startTs.getTime()) / 1000L;
                if (diff >= 0) {
                    durationsSeconds.add(diff);
                }
            }
        });

        if (durationsSeconds.isEmpty()) {
            return 0.0;
        }
        double avgSecs = durationsSeconds.stream().mapToLong(Long::longValue).average().orElse(0.0);
        return Math.round((avgSecs / 86400.0) * 10.0) / 10.0;
    }

    public List<com.kemkendra.admin.analytics.dto.TopProductDto> getMostOrderedProductsBetween(
            LocalDateTime from, LocalDateTime to, int limit) {
        String sql = "SELECT master_product_id, master_product_code, product_name, unit, " +
                "COUNT(*) as cnt, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM(total_amount), 0) as total_amt " +
                "FROM purchase_orders WHERE created_at >= ? AND created_at < ? AND status NOT IN ('CANCELLED', 'REJECTED') " +
                "GROUP BY master_product_id, master_product_code, product_name, unit " +
                "ORDER BY cnt DESC, total_amt DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, (rs, rowNum) -> {
            String idStr = rs.getString("master_product_id");
            UUID mpId = idStr != null ? UUID.fromString(idStr) : null;
            return new com.kemkendra.admin.analytics.dto.TopProductDto(
                    mpId,
                    rs.getString("master_product_code"),
                    rs.getString("product_name"),
                    rs.getLong("cnt"),
                    rs.getBigDecimal("total_qty"),
                    rs.getBigDecimal("total_amt"),
                    rs.getString("unit") != null ? rs.getString("unit") : "KG"
            );
        });
    }

    public List<com.kemkendra.admin.analytics.dto.TopSupplierDto> getMostActiveSuppliersBetween(
            LocalDateTime from, LocalDateTime to, int limit) {
        String sql = "SELECT po.supplier_id, s.name as company_name, COUNT(*) as cnt, " +
                "SUM(CASE WHEN po.status IN ('COMPLETED', 'DELIVERED') THEN 1 ELSE 0 END) as completed_cnt, " +
                "COALESCE(SUM(po.total_amount), 0) as gmv " +
                "FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id " +
                "WHERE po.created_at >= ? AND po.created_at < ? AND po.status NOT IN ('CANCELLED', 'REJECTED') " +
                "GROUP BY po.supplier_id, s.name " +
                "ORDER BY cnt DESC, gmv DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, (rs, rowNum) -> new com.kemkendra.admin.analytics.dto.TopSupplierDto(
                rs.getLong("supplier_id"),
                rs.getString("company_name") != null ? rs.getString("company_name") : "Supplier #" + rs.getLong("supplier_id"),
                rs.getLong("cnt"),
                rs.getLong("completed_cnt"),
                rs.getBigDecimal("gmv")
        ));
    }

    public List<com.kemkendra.admin.analytics.dto.SupplierPerformanceRowDto> getSupplierPerformanceSummaries(int limit) {
        String respSql = "SELECT r.supplier_id, r.created_at as rfq_time, MIN(q.created_at) as quote_time " +
                "FROM quotations q JOIN rfqs r ON q.rfq_id = r.id " +
                "GROUP BY r.supplier_id, r.id, r.created_at";
        Map<Long, List<Long>> supplierDurations = new HashMap<>();
        jdbcTemplate.query(respSql, rs -> {
            Long sId = rs.getLong("supplier_id");
            Timestamp rfqTs = rs.getTimestamp("rfq_time");
            Timestamp quoteTs = rs.getTimestamp("quote_time");
            if (rfqTs != null && quoteTs != null) {
                long diff = (quoteTs.getTime() - rfqTs.getTime()) / 1000L;
                if (diff >= 0) {
                    supplierDurations.computeIfAbsent(sId, k -> new ArrayList<>()).add(diff);
                }
            }
        });

        String sql = "SELECT s.id, s.name as company_name, s.verification_status, " +
                "(SELECT COUNT(*) FROM rfqs r WHERE r.supplier_id = s.id) as rfqs_rec, " +
                "(SELECT COUNT(*) FROM quotations q JOIN rfqs r2 ON q.rfq_id = r2.id WHERE r2.supplier_id = s.id) as quotes_sub, " +
                "(SELECT COUNT(*) FROM rfqs r3 WHERE r3.supplier_id = s.id AND r3.accepted_quotation_id IS NOT NULL) as quotes_acc, " +
                "(SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status IN ('COMPLETED', 'DELIVERED')) as orders_comp " +
                "FROM suppliers s ORDER BY orders_comp DESC, quotes_acc DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            long rec = rs.getLong("rfqs_rec");
            long sub = rs.getLong("quotes_sub");
            long acc = rs.getLong("quotes_acc");
            long comp = rs.getLong("orders_comp");
            double winRate = sub > 0 ? Math.round(((double) acc / sub * 100.0) * 10.0) / 10.0 : 0.0;

            List<Long> durations = supplierDurations.get(rs.getLong("id"));
            double avgHours = 0.0;
            if (durations != null && !durations.isEmpty()) {
                double avgSecs = durations.stream().mapToLong(Long::longValue).average().orElse(0.0);
                avgHours = Math.round((avgSecs / 3600.0) * 10.0) / 10.0;
            }

            return new com.kemkendra.admin.analytics.dto.SupplierPerformanceRowDto(
                    rs.getLong("id"),
                    rs.getString("company_name"),
                    rs.getString("verification_status"),
                    rec,
                    sub,
                    acc,
                    comp,
                    winRate,
                    avgHours
            );
        });
    }

    public List<com.kemkendra.admin.analytics.dto.ProductDemandDto> getMostRequestedChemicalsBetween(
            LocalDateTime from, LocalDateTime to, int limit) {
        String sql = "SELECT r.master_product_id, mp.name, mp.cas_number, mp.category, r.unit, " +
                "COUNT(*) as rfq_cnt, COALESCE(SUM(r.quantity), 0) as total_qty " +
                "FROM rfqs r LEFT JOIN master_products mp ON r.master_product_id = mp.id " +
                "WHERE r.created_at >= ? AND r.created_at < ? " +
                "GROUP BY r.master_product_id, mp.name, mp.cas_number, mp.category, r.unit " +
                "ORDER BY rfq_cnt DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, (rs, rowNum) -> {
            String idStr = rs.getString("master_product_id");
            UUID mpId = idStr != null ? UUID.fromString(idStr) : null;
            String name = rs.getString("name");
            if (name == null) name = "Industrial Chemical";
            return new com.kemkendra.admin.analytics.dto.ProductDemandDto(
                    mpId,
                    name,
                    rs.getString("cas_number"),
                    rs.getString("category"),
                    rs.getLong("rfq_cnt"),
                    rs.getBigDecimal("total_qty"),
                    rs.getString("unit") != null ? rs.getString("unit") : "KG"
            );
        });
    }

    public List<com.kemkendra.admin.analytics.dto.CategoryActivityDto> getCategoryActivityBetween(
            LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT mp.category as cat, COUNT(DISTINCT r.id) as rfq_cnt, " +
                "COUNT(DISTINCT po.id) as order_cnt, COUNT(DISTINCT so.id) as off_cnt " +
                "FROM master_products mp " +
                "LEFT JOIN rfqs r ON r.master_product_id = mp.id AND r.created_at >= ? AND r.created_at < ? " +
                "LEFT JOIN purchase_orders po ON po.master_product_id = mp.id AND po.created_at >= ? AND po.created_at < ? " +
                "LEFT JOIN supplier_offerings so ON so.master_product_id = mp.id " +
                "WHERE mp.category IS NOT NULL " +
                "GROUP BY mp.category ORDER BY rfq_cnt DESC, order_cnt DESC";

        return jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
            ps.setTimestamp(3, Timestamp.valueOf(from));
            ps.setTimestamp(4, Timestamp.valueOf(to));
        }, (rs, rowNum) -> new com.kemkendra.admin.analytics.dto.CategoryActivityDto(
                rs.getString("cat"),
                rs.getLong("rfq_cnt"),
                rs.getLong("order_cnt"),
                rs.getLong("off_cnt")
        ));
    }

    public List<com.kemkendra.admin.analytics.dto.ProductSummaryDto> getProductsWithNoActiveOfferings(int limit) {
        String sql = "SELECT mp.id, mp.master_product_code, mp.name, mp.cas_number, mp.category " +
                "FROM master_products mp " +
                "WHERE mp.deactivated_at IS NULL " +
                "AND NOT EXISTS ( " +
                "  SELECT 1 FROM supplier_offerings so WHERE so.master_product_id = mp.id " +
                "  AND so.availability_status = 'AVAILABLE' AND so.moderation_status = 'APPROVED' " +
                ") ORDER BY mp.created_at DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String idStr = rs.getString("id");
            UUID mpId = idStr != null ? UUID.fromString(idStr) : null;
            return new com.kemkendra.admin.analytics.dto.ProductSummaryDto(
                    mpId,
                    rs.getString("master_product_code"),
                    rs.getString("name"),
                    rs.getString("cas_number"),
                    rs.getString("category")
            );
        });
    }

    public List<com.kemkendra.admin.analytics.dto.ProductDemandGrowthDto> getProductsWithIncreasingDemand(
            LocalDateTime currentStart, LocalDateTime currentEnd,
            LocalDateTime prevStart, LocalDateTime prevEnd, int limit) {
        String sql = "SELECT mp.id, mp.name, mp.cas_number, " +
                "COUNT(DISTINCT CASE WHEN r.created_at >= ? AND r.created_at < ? THEN r.id END) as cur_cnt, " +
                "COUNT(DISTINCT CASE WHEN r.created_at >= ? AND r.created_at < ? THEN r.id END) as prev_cnt " +
                "FROM master_products mp " +
                "JOIN rfqs r ON r.master_product_id = mp.id " +
                "WHERE r.created_at >= ? AND r.created_at < ? " +
                "GROUP BY mp.id, mp.name, mp.cas_number " +
                "HAVING COUNT(DISTINCT CASE WHEN r.created_at >= ? AND r.created_at < ? THEN r.id END) > " +
                "       COUNT(DISTINCT CASE WHEN r.created_at >= ? AND r.created_at < ? THEN r.id END) " +
                "ORDER BY cur_cnt DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(currentStart));
            ps.setTimestamp(2, Timestamp.valueOf(currentEnd));
            ps.setTimestamp(3, Timestamp.valueOf(prevStart));
            ps.setTimestamp(4, Timestamp.valueOf(prevEnd));
            ps.setTimestamp(5, Timestamp.valueOf(prevStart));
            ps.setTimestamp(6, Timestamp.valueOf(currentEnd));
            ps.setTimestamp(7, Timestamp.valueOf(currentStart));
            ps.setTimestamp(8, Timestamp.valueOf(currentEnd));
            ps.setTimestamp(9, Timestamp.valueOf(prevStart));
            ps.setTimestamp(10, Timestamp.valueOf(prevEnd));
        }, (rs, rowNum) -> {
            String idStr = rs.getString("id");
            UUID mpId = idStr != null ? UUID.fromString(idStr) : null;
            long cur = rs.getLong("cur_cnt");
            long prev = rs.getLong("prev_cnt");
            double growth = prev > 0 ? Math.round(((double) (cur - prev) / prev * 100.0) * 10.0) / 10.0 : 100.0;
            return new com.kemkendra.admin.analytics.dto.ProductDemandGrowthDto(
                    mpId,
                    rs.getString("name"),
                    rs.getString("cas_number"),
                    cur,
                    prev,
                    growth
            );
        });
    }

    public Map<String, Object> getInvoiceTotalsBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT " +
                "COALESCE(SUM(grand_total), 0) as total_val, " +
                "COALESCE(SUM(amount_paid), 0) as paid_val, " +
                "COALESCE(SUM(amount_due), 0) as due_val, " +
                "COALESCE(SUM(CASE WHEN status = 'PARTIALLY_PAID' THEN amount_paid ELSE 0 END), 0) as part_paid_val, " +
                "COALESCE(SUM(CASE WHEN due_date < CURRENT_DATE AND amount_due > 0 AND status NOT IN ('CANCELLED', 'PAID') THEN amount_due ELSE 0 END), 0) as overdue_val, " +
                "COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled_cnt, " +
                "COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN grand_total ELSE 0 END), 0) as cancelled_amt " +
                "FROM invoices WHERE created_at >= ? AND created_at < ?";

        Map<String, Object> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            map.put("total_val", rs.getBigDecimal("total_val"));
            map.put("paid_val", rs.getBigDecimal("paid_val"));
            map.put("due_val", rs.getBigDecimal("due_val"));
            map.put("part_paid_val", rs.getBigDecimal("part_paid_val"));
            map.put("overdue_val", rs.getBigDecimal("overdue_val"));
            map.put("cancelled_cnt", rs.getLong("cancelled_cnt"));
            map.put("cancelled_amt", rs.getBigDecimal("cancelled_amt"));
        });
        return map;
    }

    public Map<String, Long> getPaymentConfirmationStatusBreakdownBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT status, COUNT(*) as cnt FROM invoice_payment_records " +
                "WHERE created_at >= ? AND created_at < ? GROUP BY status";

        Map<String, Long> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            map.put(rs.getString("status"), rs.getLong("cnt"));
        });
        return map;
    }

    public Map<String, Object> getDisputedPaymentsBetween(LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT COUNT(*) as dispute_cnt, COALESCE(SUM(i.grand_total), 0) as dispute_amt " +
                "FROM disputes d LEFT JOIN invoices i ON d.invoice_id = i.id " +
                "WHERE d.created_at >= ? AND d.created_at < ?";

        Map<String, Object> map = new HashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setTimestamp(1, Timestamp.valueOf(from));
            ps.setTimestamp(2, Timestamp.valueOf(to));
        }, rs -> {
            map.put("count", rs.getLong("dispute_cnt"));
            map.put("amount", rs.getBigDecimal("dispute_amt"));
        });
        return map;
    }
}
