-- V19__add_kyc_documents_to_affiliation_requests.sql
-- Documents KYC liés aux demandes d'affiliation marchand (US01).

ALTER TABLE merchant_affiliation_requests
    ADD COLUMN IF NOT EXISTS id_document_image TEXT,
    ADD COLUMN IF NOT EXISTS id_document_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS id_document_number VARCHAR(100),
    ADD COLUMN IF NOT EXISTS business_registration_image TEXT,
    ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS kyc_submitted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_merchant_affiliation_kyc_status
    ON merchant_affiliation_requests(kyc_status);
