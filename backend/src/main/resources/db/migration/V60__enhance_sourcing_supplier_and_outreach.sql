-- Flyway Migration V60: Enhance Sourcing Suppliers and Outreach Logs
-- Supports full supplier lifecycle, outreach tracking, follow-up scheduling, and directory profile reuse.

-- 1. Enhance sourcing_suppliers table
ALTER TABLE sourcing_suppliers
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS supplier_type VARCHAR(50) DEFAULT 'MANUFACTURER',
    ADD COLUMN IF NOT EXISTS products_supplied TEXT,
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';

CREATE INDEX IF NOT EXISTS idx_sourcing_suppliers_type ON sourcing_suppliers(supplier_type);
CREATE INDEX IF NOT EXISTS idx_sourcing_suppliers_verif ON sourcing_suppliers(verification_status);

-- 2. Enhance sourcing_outreach_logs table
ALTER TABLE sourcing_outreach_logs
    ADD COLUMN IF NOT EXISTS contact_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS response_status VARCHAR(50) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_followup ON sourcing_outreach_logs(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_resp_status ON sourcing_outreach_logs(response_status);
