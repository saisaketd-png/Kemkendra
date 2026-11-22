-- Flyway Migration V61: Enhance Sourcing Quotations and Create Sourcing Proposal Options
-- Enables comprehensive supplier quotation management, comparable pricing metrics,
-- multi-option curated proposals, and secure buyer decision workflows.

-- 1. Enhance sourcing_quotations table
ALTER TABLE sourcing_quotations
    ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS unit VARCHAR(20),
    ADD COLUMN IF NOT EXISTS available_quantity NUMERIC(18, 2),
    ADD COLUMN IF NOT EXISTS product_grade VARCHAR(100),
    ADD COLUMN IF NOT EXISTS purity_specifications TEXT,
    ADD COLUMN IF NOT EXISTS packaging VARCHAR(150),
    ADD COLUMN IF NOT EXISTS delivery_charges NUMERIC(18, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS supporting_documents TEXT,
    ADD COLUMN IF NOT EXISTS share_with_buyer BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_sourcing_quotations_share ON sourcing_quotations(share_with_buyer);

-- 2. Enhance sourcing_proposals table
ALTER TABLE sourcing_proposals
    ADD COLUMN IF NOT EXISTS summary_notes TEXT,
    ADD COLUMN IF NOT EXISTS recommendation_notes TEXT,
    ADD COLUMN IF NOT EXISTS buyer_feedback TEXT,
    ADD COLUMN IF NOT EXISTS selected_option_id UUID;

CREATE INDEX IF NOT EXISTS idx_sourcing_proposals_status ON sourcing_proposals(status);

-- 3. Create sourcing_proposal_options table
CREATE TABLE IF NOT EXISTS sourcing_proposal_options (
    id UUID PRIMARY KEY,
    sourcing_proposal_id UUID NOT NULL REFERENCES sourcing_proposals(id) ON DELETE CASCADE,
    sourcing_quotation_id UUID REFERENCES sourcing_quotations(id) ON DELETE SET NULL,
    option_label VARCHAR(100) NOT NULL,
    supplier_display_name VARCHAR(255) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    grade VARCHAR(100),
    purity_specifications TEXT,
    offered_price_per_unit NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    quantity NUMERIC(18, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    moq NUMERIC(18, 2),
    lead_time_days INTEGER,
    packaging VARCHAR(150),
    delivery_terms VARCHAR(150),
    payment_terms VARCHAR(150),
    valid_until TIMESTAMP,
    document_url VARCHAR(500),
    recommendation_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'OFFERED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposal_options_proposal ON sourcing_proposal_options(sourcing_proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_options_quotation ON sourcing_proposal_options(sourcing_quotation_id);
