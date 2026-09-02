-- V17__create_vault_tokens.sql
-- PCI-DSS Vault : chiffrement AES-256-GCM des PAN de cartes bancaires.

CREATE TABLE IF NOT EXISTS vault_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token           VARCHAR(255) NOT NULL UNIQUE,
    encrypted_pan   VARCHAR(512) NOT NULL,
    pan_hash        VARCHAR(64) NOT NULL,
    pan_last4       VARCHAR(4),
    expiry_month    VARCHAR(2),
    expiry_year     VARCHAR(2),
    card_brand      VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_vault_tokens_user_id ON vault_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_vault_tokens_pan_hash ON vault_tokens(pan_hash);
CREATE INDEX IF NOT EXISTS idx_vault_tokens_active ON vault_tokens(is_active);
