-- V56: Document Management and Compliance Enhancements
-- Adds document title, reviewer metadata, review notes, public availability flag, and replacement lineage.

-- 1. Add new columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS replaced_by_id UUID;

-- 2. Backfill existing records for backward compatibility
UPDATE documents SET title = original_file_name WHERE title IS NULL;
UPDATE documents SET is_public = TRUE WHERE owner_type IN ('PRODUCT', 'MASTER_PRODUCT') AND is_public IS NULL;
UPDATE documents SET is_public = FALSE WHERE is_public IS NULL;
UPDATE documents SET verification_status = 'APPROVED' WHERE verification_status = 'ACTIVE' OR verification_status IS NULL;

-- 3. Create high-performance indexes for compliance filtering and expiry queries
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_documents_owner_status ON documents(owner_type, owner_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_documents_is_public ON documents(is_public);
CREATE INDEX IF NOT EXISTS idx_documents_replaced_by ON documents(replaced_by_id);
