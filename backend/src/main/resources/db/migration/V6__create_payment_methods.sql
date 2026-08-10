-- V6__create_payment_methods.sql
-- Moyens de paiement enregistrés par les utilisateurs.

CREATE TABLE IF NOT EXISTS payment_methods (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id    UUID NOT NULL REFERENCES payment_method_categories(id) ON DELETE RESTRICT,
    type           VARCHAR(20) NOT NULL,
    provider       VARCHAR(100),
    account_number VARCHAR(100),
    expiry_date    VARCHAR(7),
    is_favorite    BOOLEAN NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_category_id ON payment_methods(category_id);
