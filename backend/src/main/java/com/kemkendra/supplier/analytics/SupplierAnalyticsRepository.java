package com.kemkendra.supplier.analytics;

import com.kemkendra.admin.analytics.dto.DataPointDto;
import com.kemkendra.admin.analytics.dto.TopProductDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Repository
public class SupplierAnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public SupplierAnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long countRfqsReceived(Long supplierId) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rfqs WHERE supplier_id = ?", Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public long countActiveRfqs(Long supplierId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE supplier_id = ? AND status IN ('PENDING', 'CONTACTED', 'QUOTED', 'COUNTERED')",
                Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public long countQuotationsSubmitted(Long supplierId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM quotations q JOIN rfqs r ON q.rfq_id = r.id WHERE r.supplier_id = ?",
                Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public long countQuotationsAccepted(Long supplierId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE supplier_id = ? AND accepted_quotation_id IS NOT NULL",
                Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public double getAverageResponseTimeHours(Long supplierId) {
        String sql = "SELECT r.created_at as rfq_time, MIN(q.created_at) as quote_time " +
                "FROM quotations q JOIN rfqs r ON q.rfq_id = r.id " +
                "WHERE r.supplier_id = ? GROUP BY r.id, r.created_at";

        List<Long> durationsSeconds = new ArrayList<>();
        jdbcTemplate.query(sql, ps -> ps.setLong(1, supplierId), rs -> {
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

    public long countOrdersReceived(Long supplierId) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = ?", Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public long countOrdersCompleted(Long supplierId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE supplier_id = ? AND status IN ('COMPLETED', 'DELIVERED')",
                Long.class, supplierId);
        return count != null ? count : 0L;
    }

    public BigDecimal sumFulfilledGmv(Long supplierId) {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE supplier_id = ? AND status IN ('COMPLETED', 'DELIVERED')",
                BigDecimal.class, supplierId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumOutstandingReceivables(Long supplierId) {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount_due), 0) FROM invoices WHERE supplier_id = ? AND status NOT IN ('CANCELLED', 'PAID')",
                BigDecimal.class, supplierId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public List<DataPointDto> getFulfillmentTrends(Long supplierId, LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COALESCE(SUM(total_amount), 0) as amt " +
                "FROM purchase_orders WHERE supplier_id = ? AND created_at >= ? AND created_at < ? " +
                "AND status NOT IN ('CANCELLED', 'REJECTED') GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, BigDecimal> dateMap = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setLong(1, supplierId);
            ps.setTimestamp(2, Timestamp.valueOf(from));
            ps.setTimestamp(3, Timestamp.valueOf(to));
        }, rs -> {
            java.sql.Date d = rs.getDate("d");
            if (d != null) {
                dateMap.put(d.toLocalDate(), rs.getBigDecimal("amt"));
            }
        });

        List<DataPointDto> list = new ArrayList<>();
        dateMap.forEach((date, val) -> list.add(new DataPointDto(date.toString(), val.doubleValue())));
        return list;
    }

    public Map<String, Long> getOrderStatusBreakdown(Long supplierId) {
        String sql = "SELECT status, COUNT(*) as cnt FROM purchase_orders WHERE supplier_id = ? GROUP BY status";
        Map<String, Long> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> ps.setLong(1, supplierId), rs -> {
            map.put(rs.getString("status"), rs.getLong("cnt"));
        });
        return map;
    }

    public List<TopProductDto> getTopSellingProducts(Long supplierId, int limit) {
        String sql = "SELECT master_product_id, master_product_code, product_name, unit, " +
                "COUNT(*) as cnt, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM(total_amount), 0) as total_amt " +
                "FROM purchase_orders WHERE supplier_id = ? AND status NOT IN ('CANCELLED', 'REJECTED') " +
                "GROUP BY master_product_id, master_product_code, product_name, unit " +
                "ORDER BY cnt DESC, total_amt DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> ps.setLong(1, supplierId), (rs, rowNum) -> {
            String idStr = rs.getString("master_product_id");
            UUID mpId = idStr != null ? UUID.fromString(idStr) : null;
            return new TopProductDto(
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
}
