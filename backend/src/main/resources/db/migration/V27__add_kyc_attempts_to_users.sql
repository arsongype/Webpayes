-- Sprint 4: KYC retry attempts (max 3)
ALTER TABLE users ADD COLUMN kyc_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN kyc_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN kyc_locked_until TIMESTAMP;
