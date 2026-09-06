-- Flyway migration V55: Enhance purchase orders and shipments for full lifecycle order management

-- 1. Financial breakdown, delivery expectations, and dispatch/dispute lifecycle on purchase_orders
ALTER TABLE purchase_orders
    ADD COLUMN IF NOT EXISTS subtotal NUMERIC(18, 4),
    ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(18, 4) DEFAULT 0.0000,
    ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS ready_for_dispatch_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS in_transit_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS disputed_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS dispute_id UUID;

CREATE INDEX IF NOT EXISTS idx_po_dispute_id ON purchase_orders(dispute_id);

-- 2. Basic shipment milestone and delivery note columns on shipments
ALTER TABLE shipments
    ADD COLUMN IF NOT EXISTS shipment_status VARCHAR(30) DEFAULT 'DISPATCHED',
    ADD COLUMN IF NOT EXISTS dispatch_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

-- Make carrier optional to support cases where carrier name is not provided
ALTER TABLE shipments ALTER COLUMN carrier DROP NOT NULL;
