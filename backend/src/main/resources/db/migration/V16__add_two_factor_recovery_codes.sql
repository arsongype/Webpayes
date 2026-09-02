ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_recovery_codes VARCHAR(1000);
