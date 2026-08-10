-- V5__create_payment_method_categories.sql
-- Catégories de moyens de paiement.

CREATE TABLE IF NOT EXISTS payment_method_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    icon        VARCHAR(50),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_method_categories_name ON payment_method_categories(name);
