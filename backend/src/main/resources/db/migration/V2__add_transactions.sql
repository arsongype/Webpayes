CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_account_id UUID NOT NULL REFERENCES accounts(id),
    receiver_account_id UUID NOT NULL REFERENCES accounts(id),
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MGA',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    reference VARCHAR(50) NOT NULL UNIQUE,
    metadata JSONB,
    fraud_score DOUBLE PRECISION,
    risk_score DOUBLE PRECISION,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    account_id UUID NOT NULL REFERENCES accounts(id),
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MGA',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_ledger_transaction ON ledger_entries(transaction_id);