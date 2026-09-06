package com.kemkendra.buyer.analytics;

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
public class BuyerAnalyticsRepository {

    private final JdbcTemplate jdbcTemplate;

    public BuyerAnalyticsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long countTotalRfqs(UUID buyerId) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM rfqs WHERE buyer_id = ?", Long.class, buyerId);
        return count != null ? count : 0L;
    }

    public long countActiveRfqs(UUID buyerId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM rfqs WHERE buyer_id = ? AND status IN ('PENDING', 'CONTACTED', 'QUOTED', 'COUNTERED')",
                Long.class, buyerId);
        return count != null ? count : 0L;
    }

    public long countQuotationsReceived(UUID buyerId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM quotations q JOIN rfqs r ON q.rfq_id = r.id WHERE r.buyer_id = ?",
                Long.class, buyerId);
        return count != null ? count : 0L;
    }

    public long countOrdersPlaced(UUID buyerId) {
        Long count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ?", Long.class, buyerId);
        return count != null ? count : 0L;
    }

    public long countCompletedOrders(UUID buyerId) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM purchase_orders WHERE buyer_id = ? AND status IN ('COMPLETED', 'DELIVERED')",
                Long.class, buyerId);
        return count != null ? count : 0L;
    }

    public BigDecimal sumTotalSpent(UUID buyerId) {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(total_amount), 0) FROM purchase_orders WHERE buyer_id = ? AND status NOT IN ('CANCELLED', 'REJECTED')",
                BigDecimal.class, buyerId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public BigDecimal sumOutstandingInvoices(UUID buyerId) {
        BigDecimal sum = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(amount_due), 0) FROM invoices WHERE buyer_id = ? AND status NOT IN ('CANCELLED', 'PAID')",
                BigDecimal.class, buyerId);
        return sum != null ? sum : BigDecimal.ZERO;
    }

    public double getAverageQuotationTurnaroundHours(UUID buyerId) {
        String sql = "SELECT r.created_at as rfq_time, MIN(q.created_at) as quote_time " +
                "FROM quotations q JOIN rfqs r ON q.rfq_id = r.id " +
                "WHERE r.buyer_id = ? GROUP BY r.id, r.created_at";

        List<Long> durationsSeconds = new ArrayList<>();
        jdbcTemplate.query(sql, ps -> ps.setObject(1, buyerId), rs -> {
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

    public List<DataPointDto> getSpendTrends(UUID buyerId, LocalDateTime from, LocalDateTime to) {
        String sql = "SELECT CAST(created_at AS DATE) as d, COALESCE(SUM(total_amount), 0) as amt " +
                "FROM purchase_orders WHERE buyer_id = ? AND created_at >= ? AND created_at < ? " +
                "AND status NOT IN ('CANCELLED', 'REJECTED') GROUP BY CAST(created_at AS DATE) ORDER BY d ASC";

        Map<LocalDate, BigDecimal> dateMap = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> {
            ps.setObject(1, buyerId);
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

    public Map<String, Long> getOrderStatusBreakdown(UUID buyerId) {
        String sql = "SELECT status, COUNT(*) as cnt FROM purchase_orders WHERE buyer_id = ? GROUP BY status";
        Map<String, Long> map = new LinkedHashMap<>();
        jdbcTemplate.query(sql, ps -> ps.setObject(1, buyerId), rs -> {
            map.put(rs.getString("status"), rs.getLong("cnt"));
        });
        return map;
    }

    public List<TopProductDto> getMostPurchasedProducts(UUID buyerId, int limit) {
        String sql = "SELECT master_product_id, master_product_code, product_name, unit, " +
                "COUNT(*) as cnt, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM(total_amount), 0) as total_amt " +
                "FROM purchase_orders WHERE buyer_id = ? AND status NOT IN ('CANCELLED', 'REJECTED') " +
                "GROUP BY master_product_id, master_product_code, product_name, unit " +
                "ORDER BY cnt DESC, total_amt DESC LIMIT " + Math.max(1, limit);

        return jdbcTemplate.query(sql, ps -> ps.setObject(1, buyerId), (rs, rowNum) -> {
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
