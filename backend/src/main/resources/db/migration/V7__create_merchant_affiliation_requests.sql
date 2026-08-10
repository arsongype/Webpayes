-- V7__create_merchant_affiliation_requests.sql
-- Demandes d'affiliation marchand.

CREATE TABLE IF NOT EXISTS merchant_affiliation_requests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason      TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_merchant_affiliation_requests_user_id ON merchant_affiliation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_merchant_affiliation_requests_status ON merchant_affiliation_requests(status);
