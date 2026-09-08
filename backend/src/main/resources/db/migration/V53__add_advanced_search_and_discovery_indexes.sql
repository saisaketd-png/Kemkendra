-- Flyway migration V53: Advanced Search and Discovery Performance Indexes

-- 1. Master Products Text and Filter Indexes
CREATE INDEX IF NOT EXISTS idx_master_products_name
    ON master_products(name);

CREATE INDEX IF NOT EXISTS idx_master_products_status_category
    ON master_products(status, category);

-- 2. Supplier Offerings Filter and Sorting Indexes
CREATE INDEX IF NOT EXISTS idx_supplier_offerings_purity
    ON supplier_offerings(purity);

CREATE INDEX IF NOT EXISTS idx_supplier_offerings_price
    ON supplier_offerings(price);

CREATE INDEX IF NOT EXISTS idx_supplier_offerings_moderation
    ON supplier_offerings(moderation_status);

CREATE INDEX IF NOT EXISTS idx_supplier_offerings_avail_mod
    ON supplier_offerings(availability_status, moderation_status);

-- 3. Suppliers Verification and Search Indexes
CREATE INDEX IF NOT EXISTS idx_suppliers_verification
    ON suppliers(verified, verification_status);

CREATE INDEX IF NOT EXISTS idx_suppliers_name
    ON suppliers(name);

CREATE INDEX IF NOT EXISTS idx_suppliers_country
    ON suppliers(country_name);
