-- V18__create_merchant_api_keys.sql
-- Clés API pour l'authentification des marchands (Sprint 1 - Portal Marchand).

CREATE TABLE IF NOT EXISTS merchant_api_keys (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_profile_id UUID NOT NULL REFERENCES merchant_profiles(id) ON DELETE CASCADE,
    api_key_hash        VARCHAR(255) NOT NULL UNIQUE,
    api_key_prefix      VARCHAR(16) NOT NULL,
    name                VARCHAR(100) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at          TIMESTAMPTZ,
    last_used_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_merchant_api_keys_merchant_id ON merchant_api_keys(merchant_profile_id);
CREATE INDEX IF NOT EXISTS idx_merchant_api_keys_prefix ON merchant_api_keys(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_merchant_api_keys_active ON merchant_api_keys(is_active);
