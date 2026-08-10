-- V10__create_disputes.sql
-- Litiges sur les transactions.

CREATE TABLE IF NOT EXISTS disputes (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    reason         VARCHAR(255) NOT NULL,
    description    TEXT NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    resolution     TEXT,
    created_by     UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolved_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_transaction_id ON disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_disputes_created_by ON disputes(created_by);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
