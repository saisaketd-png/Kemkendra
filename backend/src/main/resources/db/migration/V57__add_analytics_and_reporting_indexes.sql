-- V57: Add Analytics and Reporting Indexes and Lightweight Product Event Tracking

-- 1. Lightweight privacy-conscious event tracking for product searches and views
CREATE TABLE IF NOT EXISTS product_analytics_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(30) NOT NULL, -- 'SEARCH', 'VIEW'
    search_term VARCHAR(255),
    master_product_id UUID,
    category VARCHAR(100),
    created_at TIMESTAMP NOT NULL
);

-- 2. Indexes for product analytics event queries
CREATE INDEX IF NOT EXISTS idx_product_events_search ON product_analytics_events(event_type, search_term, created_at);
CREATE INDEX IF NOT EXISTS idx_product_events_product ON product_analytics_events(event_type, master_product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_product_events_type_created ON product_analytics_events(event_type, created_at);

-- 3. Composite performance indexes for fast reporting and date filtering
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at_status ON rfqs(created_at, status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq_created ON quotations(rfq_id, created_at);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_status ON purchase_orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_status_due ON invoices(created_at, status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_buyer ON invoices(supplier_id, buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_status ON invoice_payment_records(payment_date, status);
CREATE INDEX IF NOT EXISTS idx_disputes_created_status ON disputes(created_at, status);
