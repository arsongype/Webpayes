-- V8__create_billing_infos.sql
-- Informations de facturation des utilisateurs.

CREATE TABLE IF NOT EXISTS billing_infos (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name    VARCHAR(200) NOT NULL,
    address      VARCHAR(255) NOT NULL,
    city         VARCHAR(100) NOT NULL,
    postal_code  VARCHAR(20) NOT NULL,
    country      VARCHAR(100) NOT NULL,
    tax_id       VARCHAR(50),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_billing_infos_user_id ON billing_infos(user_id);
