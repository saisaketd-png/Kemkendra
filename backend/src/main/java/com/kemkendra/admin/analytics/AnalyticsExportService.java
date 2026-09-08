package com.kemkendra.admin.analytics;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class AnalyticsExportService {

    private final JdbcTemplate jdbcTemplate;

    public AnalyticsExportService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // ==========================================
    // RFQ REPORT EXPORT
    // ==========================================
    public byte[] exportRfqs(LocalDateTime from, LocalDateTime to, Long supplierId, UUID buyerId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT r.id, r.sourcing_request_reference, r.buyer_id, r.supplier_id, " +
                "mp.master_product_code, COALESCE(mp.name, 'Industrial Chemical') as chemical_name, " +
                "r.quantity, r.unit, r.status, r.created_at, r.expires_at, " +
                "(SELECT COUNT(*) FROM quotations q WHERE q.rfq_id = r.id) as quote_count " +
                "FROM rfqs r LEFT JOIN master_products mp ON r.master_product_id = mp.id WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND r.created_at >= ?");
            params.add(Timestamp.valueOf(from));
        }
        if (to != null) {
            sql.append(" AND r.created_at < ?");
            params.add(Timestamp.valueOf(to));
        }
        if (supplierId != null) {
            sql.append(" AND r.supplier_id = ?");
            params.add(supplierId);
        }
        if (buyerId != null) {
            sql.append(" AND r.buyer_id = ?");
            params.add(buyerId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND r.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY r.created_at DESC LIMIT 10000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF); // UTF-8 BOM
            writer.println("RFQ ID,Reference,Chemical Name,Product Code,Quantity,Unit,Status,Quotes Received,Created At,Expires At");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("id")),
                        escapeCsv(rs.getString("sourcing_request_reference")),
                        escapeCsv(rs.getString("chemical_name")),
                        escapeCsv(rs.getString("master_product_code")),
                        escapeCsv(rs.getString("quantity")),
                        escapeCsv(rs.getString("unit")),
                        escapeCsv(rs.getString("status")),
                        escapeCsv(rs.getString("quote_count")),
                        escapeCsv(rs.getString("created_at")),
                        escapeCsv(rs.getString("expires_at"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export RFQ report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // QUOTATION REPORT EXPORT
    // ==========================================
    public byte[] exportQuotations(LocalDateTime from, LocalDateTime to, Long supplierId, String actorType) {
        StringBuilder sql = new StringBuilder(
                "SELECT q.id, q.rfq_id, r.supplier_id, s.name as supplier_name, " +
                "q.quotation_version, q.unit_price, q.currency, q.minimum_order_quantity, " +
                "q.lead_time_days, q.validity_date, q.actor_type, q.action_type, q.created_at " +
                "FROM quotations q " +
                "JOIN rfqs r ON q.rfq_id = r.id " +
                "LEFT JOIN suppliers s ON r.supplier_id = s.id WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND q.created_at >= ?");
            params.add(Timestamp.valueOf(from));
        }
        if (to != null) {
            sql.append(" AND q.created_at < ?");
            params.add(Timestamp.valueOf(to));
        }
        if (supplierId != null) {
            sql.append(" AND r.supplier_id = ?");
            params.add(supplierId);
        }
        if (actorType != null && !actorType.isBlank() && !"ALL".equalsIgnoreCase(actorType)) {
            sql.append(" AND q.actor_type = ?");
            params.add(actorType);
        }
        sql.append(" ORDER BY q.created_at DESC LIMIT 10000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("Quotation ID,RFQ ID,Supplier ID,Supplier Name,Version,Unit Price,Currency,MOQ,Lead Time (Days),Validity Date,Actor Type,Created At");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("id")),
                        escapeCsv(rs.getString("rfq_id")),
                        escapeCsv(rs.getString("supplier_id")),
                        escapeCsv(rs.getString("supplier_name")),
                        escapeCsv(rs.getString("quotation_version")),
                        escapeCsv(rs.getString("unit_price")),
                        escapeCsv(rs.getString("currency")),
                        escapeCsv(rs.getString("minimum_order_quantity")),
                        escapeCsv(rs.getString("lead_time_days")),
                        escapeCsv(rs.getString("validity_date")),
                        escapeCsv(rs.getString("actor_type")),
                        escapeCsv(rs.getString("created_at"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Quotation report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // ORDER REPORT EXPORT
    // ==========================================
    public byte[] exportOrders(LocalDateTime from, LocalDateTime to, Long supplierId, UUID buyerId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT po.id, po.po_number, po.rfq_reference, po.product_name, " +
                "po.supplier_id, s.name as supplier_name, po.buyer_id, " +
                "po.quantity, po.unit, po.unit_price, po.tax_amount, po.total_amount, po.currency, " +
                "po.status, po.payment_status, po.created_at, po.completed_at " +
                "FROM purchase_orders po LEFT JOIN suppliers s ON po.supplier_id = s.id WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND po.created_at >= ?");
            params.add(Timestamp.valueOf(from));
        }
        if (to != null) {
            sql.append(" AND po.created_at < ?");
            params.add(Timestamp.valueOf(to));
        }
        if (supplierId != null) {
            sql.append(" AND po.supplier_id = ?");
            params.add(supplierId);
        }
        if (buyerId != null) {
            sql.append(" AND po.buyer_id = ?");
            params.add(buyerId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND po.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY po.created_at DESC LIMIT 10000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("PO Number,Reference,Chemical Product,Supplier ID,Supplier Name,Quantity,Unit,Unit Price,Tax,Total Amount,Currency,Order Status,Payment Status,Order Date,Completion Date");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("po_number")),
                        escapeCsv(rs.getString("rfq_reference")),
                        escapeCsv(rs.getString("product_name")),
                        escapeCsv(rs.getString("supplier_id")),
                        escapeCsv(rs.getString("supplier_name")),
                        escapeCsv(rs.getString("quantity")),
                        escapeCsv(rs.getString("unit")),
                        escapeCsv(rs.getString("unit_price")),
                        escapeCsv(rs.getString("tax_amount")),
                        escapeCsv(rs.getString("total_amount")),
                        escapeCsv(rs.getString("currency")),
                        escapeCsv(rs.getString("status")),
                        escapeCsv(rs.getString("payment_status")),
                        escapeCsv(rs.getString("created_at")),
                        escapeCsv(rs.getString("completed_at"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Order report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // SUPPLIER REPORT EXPORT (Admin Only)
    // ==========================================
    public byte[] exportSuppliers(String verificationStatus) {
        StringBuilder sql = new StringBuilder(
                "SELECT s.id, s.name as company_name, s.verification_status, s.created_at, " +
                "(SELECT COUNT(*) FROM supplier_offerings so WHERE so.supplier_id = s.id) as catalog_offerings, " +
                "(SELECT COUNT(*) FROM rfqs r WHERE r.supplier_id = s.id) as rfqs_received, " +
                "(SELECT COUNT(*) FROM quotations q JOIN rfqs r2 ON q.rfq_id = r2.id WHERE r2.supplier_id = s.id) as quotes_submitted, " +
                "(SELECT COUNT(*) FROM purchase_orders po WHERE po.supplier_id = s.id AND po.status IN ('COMPLETED', 'DELIVERED')) as completed_orders, " +
                "(SELECT COALESCE(SUM(po2.total_amount), 0) FROM purchase_orders po2 WHERE po2.supplier_id = s.id AND po2.status NOT IN ('CANCELLED', 'REJECTED')) as total_gmv " +
                "FROM suppliers s WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (verificationStatus != null && !verificationStatus.isBlank() && !"ALL".equalsIgnoreCase(verificationStatus)) {
            sql.append(" AND s.verification_status = ?");
            params.add(verificationStatus);
        }
        sql.append(" ORDER BY s.created_at DESC LIMIT 5000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("Supplier ID,Company Name,Verification Status,Catalog Offerings,RFQs Received,Quotes Submitted,Completed Orders,Total Fulfilled GMV,Registered At");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("id")),
                        escapeCsv(rs.getString("company_name")),
                        escapeCsv(rs.getString("verification_status")),
                        escapeCsv(rs.getString("catalog_offerings")),
                        escapeCsv(rs.getString("rfqs_received")),
                        escapeCsv(rs.getString("quotes_submitted")),
                        escapeCsv(rs.getString("completed_orders")),
                        escapeCsv(rs.getString("total_gmv")),
                        escapeCsv(rs.getString("created_at"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Supplier report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // PRODUCT REPORT EXPORT (Admin Only)
    // ==========================================
    public byte[] exportProducts(String category) {
        StringBuilder sql = new StringBuilder(
                "SELECT mp.id, mp.master_product_code, mp.name, mp.cas_number, mp.category, mp.status, " +
                "(SELECT COUNT(*) FROM supplier_offerings so WHERE so.master_product_id = mp.id AND so.availability_status = 'AVAILABLE') as active_offerings, " +
                "(SELECT COUNT(*) FROM rfqs r WHERE r.master_product_id = mp.id) as total_rfqs, " +
                "(SELECT COUNT(*) FROM purchase_orders po WHERE po.master_product_id = mp.id AND po.status NOT IN ('CANCELLED', 'REJECTED')) as total_orders " +
                "FROM master_products mp WHERE mp.deactivated_at IS NULL"
        );
        List<Object> params = new ArrayList<>();

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            sql.append(" AND mp.category = ?");
            params.add(category);
        }
        sql.append(" ORDER BY mp.name ASC LIMIT 5000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("Master Product Code,Chemical Name,CAS Number,Category,Status,Active Offerings,Total RFQs,Total Orders");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("master_product_code")),
                        escapeCsv(rs.getString("name")),
                        escapeCsv(rs.getString("cas_number")),
                        escapeCsv(rs.getString("category")),
                        escapeCsv(rs.getString("status")),
                        escapeCsv(rs.getString("active_offerings")),
                        escapeCsv(rs.getString("total_rfqs")),
                        escapeCsv(rs.getString("total_orders"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Product report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // INVOICE REPORT EXPORT
    // ==========================================
    public byte[] exportInvoices(LocalDateTime from, LocalDateTime to, Long supplierId, UUID buyerId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT i.id, i.invoice_number, i.po_number, i.supplier_id, i.supplier_legal_name, " +
                "i.buyer_legal_name, i.invoice_date, i.due_date, i.taxable_amount, i.total_tax_amount, " +
                "i.grand_total, i.amount_paid, i.amount_due, i.status, i.payment_status, i.currency " +
                "FROM invoices i WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND i.created_at >= ?");
            params.add(Timestamp.valueOf(from));
        }
        if (to != null) {
            sql.append(" AND i.created_at < ?");
            params.add(Timestamp.valueOf(to));
        }
        if (supplierId != null) {
            sql.append(" AND i.supplier_id = ?");
            params.add(supplierId);
        }
        if (buyerId != null) {
            sql.append(" AND i.buyer_id = ?");
            params.add(buyerId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND i.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY i.created_at DESC LIMIT 10000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("Invoice Number,PO Number,Supplier Legal Name,Buyer Legal Name,Invoice Date,Due Date,Taxable Amount,Total Tax,Grand Total,Amount Paid,Amount Due,Currency,Invoice Status,Payment Status");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("invoice_number")),
                        escapeCsv(rs.getString("po_number")),
                        escapeCsv(rs.getString("supplier_legal_name")),
                        escapeCsv(rs.getString("buyer_legal_name")),
                        escapeCsv(rs.getString("invoice_date")),
                        escapeCsv(rs.getString("due_date")),
                        escapeCsv(rs.getString("taxable_amount")),
                        escapeCsv(rs.getString("total_tax_amount")),
                        escapeCsv(rs.getString("grand_total")),
                        escapeCsv(rs.getString("amount_paid")),
                        escapeCsv(rs.getString("amount_due")),
                        escapeCsv(rs.getString("currency")),
                        escapeCsv(rs.getString("status")),
                        escapeCsv(rs.getString("payment_status"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Invoice report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // PAYMENT REPORT EXPORT
    // ==========================================
    public byte[] exportPayments(LocalDateTime from, LocalDateTime to, Long supplierId, UUID buyerId, String status) {
        StringBuilder sql = new StringBuilder(
                "SELECT ipr.id, ipr.payment_reference, i.invoice_number, ipr.supplier_id, " +
                "ipr.buyer_id, ipr.payment_mode, ipr.payment_date, ipr.amount_paid, " +
                "ipr.currency, ipr.bank_name, ipr.status, ipr.created_at, ipr.confirmed_at " +
                "FROM invoice_payment_records ipr JOIN invoices i ON ipr.invoice_id = i.id WHERE 1=1"
        );
        List<Object> params = new ArrayList<>();

        if (from != null) {
            sql.append(" AND ipr.created_at >= ?");
            params.add(Timestamp.valueOf(from));
        }
        if (to != null) {
            sql.append(" AND ipr.created_at < ?");
            params.add(Timestamp.valueOf(to));
        }
        if (supplierId != null) {
            sql.append(" AND ipr.supplier_id = ?");
            params.add(supplierId);
        }
        if (buyerId != null) {
            sql.append(" AND ipr.buyer_id = ?");
            params.add(buyerId);
        }
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            sql.append(" AND ipr.status = ?");
            params.add(status);
        }
        sql.append(" ORDER BY ipr.created_at DESC LIMIT 10000");

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {
            baos.write(0xEF); baos.write(0xBB); baos.write(0xBF);
            writer.println("Payment Reference,Invoice Number,Payment Mode,Payment Date,Amount Paid,Currency,Bank Name,Status,Recorded At,Confirmed At");

            jdbcTemplate.query(sql.toString(), params.toArray(), rs -> {
                writer.println(String.join(",",
                        escapeCsv(rs.getString("payment_reference")),
                        escapeCsv(rs.getString("invoice_number")),
                        escapeCsv(rs.getString("payment_mode")),
                        escapeCsv(rs.getString("payment_date")),
                        escapeCsv(rs.getString("amount_paid")),
                        escapeCsv(rs.getString("currency")),
                        escapeCsv(rs.getString("bank_name")),
                        escapeCsv(rs.getString("status")),
                        escapeCsv(rs.getString("created_at")),
                        escapeCsv(rs.getString("confirmed_at"))
                ));
            });
            writer.flush();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Payment report", e);
        }
        return baos.toByteArray();
    }

    // ==========================================
    // CSV SANITIZATION (RFC 4180 + Injection Safe)
    // ==========================================
    private String escapeCsv(Object val) {
        if (val == null) {
            return "";
        }
        String str = val.toString().trim();
        // Prevent CSV Formula Injection
        if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@") || str.startsWith("\t") || str.startsWith("\r")) {
            str = "'" + str;
        }
        if (str.contains(",") || str.contains("\"") || str.contains("\n") || str.contains("\r")) {
            str = "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }
}
