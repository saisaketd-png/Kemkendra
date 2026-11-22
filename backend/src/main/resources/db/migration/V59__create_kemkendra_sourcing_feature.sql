-- Flyway Migration V59: Create KemKendra Sourcing Feature Schema
-- Adds comprehensive sourcing fields to sourcing_requests and creates
-- assignments, suppliers, outreach logs, quotations, proposals, and status history.

-- 1. Enhance sourcing_requests table
ALTER TABLE sourcing_requests 
    ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS cas_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS grade VARCHAR(100),
    ADD COLUMN IF NOT EXISTS specifications TEXT,
    ADD COLUMN IF NOT EXISTS pharmacopeial_standard VARCHAR(50),
    ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(255),
    ADD COLUMN IF NOT EXISTS packaging VARCHAR(150),
    ADD COLUMN IF NOT EXISTS target_price NUMERIC(18, 2),
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR',
    ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
    ADD COLUMN IF NOT EXISTS additional_requirements TEXT,
    ADD COLUMN IF NOT EXISTS attachment_references TEXT,
    ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sourcing_requests_status ON sourcing_requests(status);
CREATE INDEX IF NOT EXISTS idx_sourcing_requests_assigned ON sourcing_requests(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_requests_created ON sourcing_requests(created_at DESC);

-- 2. Create sourcing_assignments table
CREATE TABLE IF NOT EXISTS sourcing_assignments (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    assigned_to_user_id UUID NOT NULL REFERENCES users(id),
    assigned_by_user_id UUID REFERENCES users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'SOURCING_EXECUTIVE',
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_assignments_request ON sourcing_assignments(sourcing_request_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_assignments_executive ON sourcing_assignments(assigned_to_user_id);

-- 3. Create sourcing_suppliers table
CREATE TABLE IF NOT EXISTS sourcing_suppliers (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    supplier_id BIGINT REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(150),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'IDENTIFIED',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_suppliers_request ON sourcing_suppliers(sourcing_request_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_suppliers_supplier ON sourcing_suppliers(supplier_id);

-- 4. Create sourcing_outreach_logs table
CREATE TABLE IF NOT EXISTS sourcing_outreach_logs (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    sourcing_supplier_id UUID REFERENCES sourcing_suppliers(id) ON DELETE SET NULL,
    outreach_channel VARCHAR(50) NOT NULL,
    contact_person VARCHAR(150),
    performed_by_user_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(255),
    details TEXT NOT NULL,
    outcome VARCHAR(100),
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_request ON sourcing_outreach_logs(sourcing_request_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_outreach_supplier ON sourcing_outreach_logs(sourcing_supplier_id);

-- 5. Create sourcing_quotations table
CREATE TABLE IF NOT EXISTS sourcing_quotations (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    sourcing_supplier_id UUID REFERENCES sourcing_suppliers(id) ON DELETE SET NULL,
    quotation_reference VARCHAR(50),
    unit_price NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    minimum_order_quantity NUMERIC(18, 2),
    lead_time_days INTEGER,
    payment_terms VARCHAR(150),
    incoterms VARCHAR(50),
    valid_until TIMESTAMP,
    notes TEXT,
    attachment_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'RECEIVED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_quotations_request ON sourcing_quotations(sourcing_request_id);
CREATE INDEX IF NOT EXISTS idx_sourcing_quotations_supplier ON sourcing_quotations(sourcing_supplier_id);

-- 6. Create sourcing_proposals table
CREATE TABLE IF NOT EXISTS sourcing_proposals (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    proposal_reference VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    offered_price_per_unit NUMERIC(18, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    quantity NUMERIC(18, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    estimated_delivery_days INTEGER,
    terms_and_conditions TEXT,
    proposal_document_url VARCHAR(500),
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    sent_to_buyer_at TIMESTAMP,
    buyer_decision_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_proposals_request ON sourcing_proposals(sourcing_request_id);

-- 7. Create sourcing_status_history table
CREATE TABLE IF NOT EXISTS sourcing_status_history (
    id UUID PRIMARY KEY,
    sourcing_request_id UUID NOT NULL REFERENCES sourcing_requests(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reason_or_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_status_history_request ON sourcing_status_history(sourcing_request_id);
