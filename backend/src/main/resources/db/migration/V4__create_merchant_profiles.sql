-- V4__create_merchant_profiles.sql
-- Profils marchands pour les utilisateurs commerçants.

CREATE TABLE IF NOT EXISTS merchant_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    shop_name           VARCHAR(150) NOT NULL,
    description         TEXT,
    logo_url            VARCHAR(255),
    phone_number        VARCHAR(30) NOT NULL,
    address             VARCHAR(255),
    bank_account_number VARCHAR(50),
    bank_name           VARCHAR(100),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merchant_profiles_user_id ON merchant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_profiles_status ON merchant_profiles(status);
