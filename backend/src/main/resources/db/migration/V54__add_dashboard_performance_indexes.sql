-- V54: Add Composite Performance Indexes for Buyer and Supplier Dashboards

-- 1. RFQ status indexes for fast buyer and supplier count queries
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_status ON rfqs(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_rfqs_supplier_status ON rfqs(supplier_id, status);

-- 2. Purchase order status indexes for buyer and supplier count queries
CREATE INDEX IF NOT EXISTS idx_purchase_orders_buyer_status ON purchase_orders(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_status ON purchase_orders(supplier_id, status);

-- 3. Invoices status and payment status composite indexes for aggregation and sums
CREATE INDEX IF NOT EXISTS idx_invoices_buyer_status_payment ON invoices(buyer_id, status, payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_status_payment ON invoices(supplier_id, status, payment_status);

-- 4. Disputes status indexes for buyer and supplier open dispute counts
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_status ON disputes(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_disputes_supplier_status ON disputes(supplier_id, status);
