-- V9__create_refunds.sql
-- Remboursements de transactions.

CREATE TABLE IF NOT EXISTS refunds (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    amount         NUMERIC(19,4) NOT NULL,
    reason         VARCHAR(255) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_by   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reviewed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_by ON refunds(requested_by);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
