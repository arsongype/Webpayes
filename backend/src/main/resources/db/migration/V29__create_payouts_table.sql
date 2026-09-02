-- V29__create_payouts_table.sql
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY,
    merchant_id UUID NOT NULL,
    account_id UUID NOT NULL,
    amount NUMERIC(19,4) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'MGA',
    destination_type VARCHAR(20) NOT NULL,
    destination_reference VARCHAR(64) NOT NULL,
    destination_name VARCHAR(128),
    bank_code VARCHAR(16),
    iban VARCHAR(34),
    bic VARCHAR(11),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    external_id VARCHAR(128),
    failure_reason TEXT,
    provider VARCHAR(32) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    executed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID,
    CONSTRAINT fk_payouts_account FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT chk_payout_dest_type CHECK (destination_type IN ('BANK_ACCOUNT','MOBILE_MONEY')),
    CONSTRAINT chk_payout_status CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED'))
);

CREATE INDEX IF NOT EXISTS idx_payouts_merchant ON payouts(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_external_id ON payouts(external_id);
CREATE INDEX IF NOT EXISTS idx_payouts_scheduled ON payouts(scheduled_at);
