-- Sprint 4: Add KYC fields to merchant profiles (US03.1)
ALTER TABLE merchant_profiles ADD COLUMN kyc_status VARCHAR(20) DEFAULT 'PENDING';
ALTER TABLE merchant_profiles ADD COLUMN kyc_document_hash VARCHAR(255);
ALTER TABLE merchant_profiles ADD COLUMN kyc_confidence DECIMAL(5,4);
ALTER TABLE merchant_profiles ADD COLUMN kyc_verified_at TIMESTAMP;
