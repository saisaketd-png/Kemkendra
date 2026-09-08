-- V51: Create Payment Tracking and Dispute Management Schema Enhancements

-- 1. Enhance Invoice Payment Records
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES purchase_orders(id);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES users(id);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS supplier_id BIGINT REFERENCES suppliers(id);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'INR';
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS proof_file_name VARCHAR(255);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS proof_file_size BIGINT;
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS proof_content_type VARCHAR(100);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS proof_storage_key VARCHAR(500);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS confirmed_by_id UUID REFERENCES users(id);
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP;
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE invoice_payment_records ADD COLUMN IF NOT EXISTS info_requested_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_payment_records_po ON invoice_payment_records(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_buyer ON invoice_payment_records(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_supplier ON invoice_payment_records(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_created ON invoice_payment_records(created_at);

-- 2. Enhance Purchase Orders Table with Commercial Settlement Tracking
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING';
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(18, 4) NOT NULL DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS payment_settled_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_purchase_orders_payment_status ON purchase_orders(payment_status);

-- 3. Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY,
    dispute_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_id UUID REFERENCES invoices(id),
    invoice_number VARCHAR(50),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    po_number VARCHAR(50),
    payment_record_id UUID REFERENCES invoice_payment_records(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    raised_by_id UUID NOT NULL REFERENCES users(id),
    raised_by_role VARCHAR(20) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_admin_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_by_id UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_disputes_number ON disputes(dispute_number);
CREATE INDEX IF NOT EXISTS idx_disputes_invoice ON disputes(invoice_id);
CREATE INDEX IF NOT EXISTS idx_disputes_po ON disputes(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer ON disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_supplier ON disputes(supplier_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_created ON disputes(created_at);

-- 4. Dispute Attachments Table
CREATE TABLE IF NOT EXISTS dispute_attachments (
    id UUID PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    uploaded_by_id UUID NOT NULL REFERENCES users(id),
    document_id UUID REFERENCES documents(id),
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    storage_key VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispute_attachments_dispute ON dispute_attachments(dispute_id);

-- 5. Dispute Timeline Events Table
CREATE TABLE IF NOT EXISTS dispute_timeline_events (
    id UUID PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    message TEXT,
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispute_timeline_dispute ON dispute_timeline_events(dispute_id);
