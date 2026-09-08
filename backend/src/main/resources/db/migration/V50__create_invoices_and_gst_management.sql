-- V50: Create Invoices, GST Tax Profiles, Sequences, Line Items, and Payment Tracking

-- 1. Business Tax Profiles for Buyers and Suppliers
CREATE TABLE IF NOT EXISTS business_tax_profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    legal_business_name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    gstin VARCHAR(15),
    is_gst_registered BOOLEAN NOT NULL DEFAULT FALSE,
    gst_registration_type VARCHAR(50) NOT NULL DEFAULT 'UNREGISTERED',
    pan_number VARCHAR(10),
    registered_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tax_profiles_user ON business_tax_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_gstin ON business_tax_profiles(gstin);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_state ON business_tax_profiles(state_code);

-- 2. Invoice Sequences Table for Concurrency-Safe Financial Year Numbering
CREATE TABLE IF NOT EXISTS invoice_sequences (
    financial_year VARCHAR(10) PRIMARY KEY,
    next_value BIGINT NOT NULL DEFAULT 1
);

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    financial_year VARCHAR(10) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    -- Reference linkage
    purchase_order_id UUID REFERENCES purchase_orders(id),
    po_number VARCHAR(50),
    rfq_id UUID REFERENCES rfqs(id),
    rfq_reference VARCHAR(50),
    quotation_id UUID REFERENCES quotations(id),
    quotation_reference VARCHAR(50),

    -- Supplier snapshot
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    supplier_user_id UUID REFERENCES users(id),
    supplier_legal_name VARCHAR(255) NOT NULL,
    supplier_trade_name VARCHAR(255),
    supplier_gstin VARCHAR(15),
    supplier_pan VARCHAR(10),
    supplier_address TEXT NOT NULL,
    supplier_city VARCHAR(100),
    supplier_state VARCHAR(100) NOT NULL,
    supplier_state_code VARCHAR(2) NOT NULL,
    supplier_postal_code VARCHAR(20),
    supplier_email VARCHAR(255),
    supplier_phone VARCHAR(50),

    -- Buyer snapshot
    buyer_id UUID NOT NULL REFERENCES users(id),
    buyer_legal_name VARCHAR(255) NOT NULL,
    buyer_trade_name VARCHAR(255),
    buyer_gstin VARCHAR(15),
    buyer_pan VARCHAR(10),
    buyer_billing_address TEXT NOT NULL,
    buyer_shipping_address TEXT NOT NULL,
    buyer_city VARCHAR(100),
    buyer_state VARCHAR(100) NOT NULL,
    buyer_state_code VARCHAR(2) NOT NULL,
    buyer_postal_code VARCHAR(20),
    buyer_email VARCHAR(255),
    buyer_phone VARCHAR(50),

    -- Supply & GST Determination
    is_interstate BOOLEAN NOT NULL DEFAULT FALSE,
    place_of_supply_state_code VARCHAR(2) NOT NULL,
    place_of_supply_state VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',

    -- Monetary Totals
    taxable_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    additional_charges NUMERIC(18, 4) NOT NULL DEFAULT 0,
    cgst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    sgst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    igst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    total_tax_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    grand_total NUMERIC(18, 4) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(18, 4) NOT NULL DEFAULT 0,
    amount_due NUMERIC(18, 4) NOT NULL DEFAULT 0,

    -- Revisions & Controls
    version INTEGER NOT NULL DEFAULT 1,
    original_invoice_id UUID REFERENCES invoices(id),
    revised_invoice_id UUID REFERENCES invoices(id),
    cancellation_reason TEXT,
    dispute_reason TEXT,
    notes TEXT,
    terms_and_conditions TEXT,
    issued_at TIMESTAMP,
    issued_by VARCHAR(100),
    cancelled_at TIMESTAMP,
    cancelled_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_po ON invoices(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_buyer ON invoices(buyer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_supplier ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_fy ON invoices(financial_year);

-- 4. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_number INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50),
    cas_number VARCHAR(50),
    hsn_code VARCHAR(20) NOT NULL DEFAULT '2901',
    quantity NUMERIC(18, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price NUMERIC(18, 4) NOT NULL,
    discount_amount NUMERIC(18, 4) NOT NULL DEFAULT 0,
    taxable_value NUMERIC(18, 4) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    cgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    cgst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    sgst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    igst_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(18, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 5. Non-Custodial Invoice Payment Records Table
CREATE TABLE IF NOT EXISTS invoice_payment_records (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    recorded_by_id UUID NOT NULL REFERENCES users(id),
    payment_reference VARCHAR(100) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(18, 4) NOT NULL,
    bank_name VARCHAR(100),
    proof_document_id UUID REFERENCES documents(id),
    status VARCHAR(30) NOT NULL DEFAULT 'PROOF_UPLOADED',
    reviewed_by_id UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    review_notes TEXT,
    dispute_reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_records_invoice ON invoice_payment_records(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON invoice_payment_records(status);

-- 6. Invoice Audit Trail Table
CREATE TABLE IF NOT EXISTS invoice_audits (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    actor_id UUID,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoice_audits_invoice ON invoice_audits(invoice_id);
