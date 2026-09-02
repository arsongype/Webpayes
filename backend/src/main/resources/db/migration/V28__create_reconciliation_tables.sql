-- Sprint 5 US04.1: ISO 20022 reconciliation
CREATE TABLE reconciliations (
    id UUID PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL UNIQUE,
    statement_date TIMESTAMP NOT NULL,
    iban VARCHAR(64),
    opening_balance NUMERIC(19,4),
    closing_balance NUMERIC(19,4),
    statement_amount NUMERIC(19,4) NOT NULL,
    book_amount NUMERIC(19,4) NOT NULL,
    discrepancy NUMERIC(19,4) NOT NULL,
    matched_count INT NOT NULL DEFAULT 0,
    unmatched_count INT NOT NULL DEFAULT 0,
    total_entries INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    notes TEXT,
    performed_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_recon_status ON reconciliations(status);
CREATE INDEX idx_recon_file_hash ON reconciliations(file_hash);
CREATE INDEX idx_recon_created_at ON reconciliations(created_at);

CREATE TABLE reconciliation_entries (
    id UUID PRIMARY KEY,
    reconciliation_id UUID NOT NULL REFERENCES reconciliations(id) ON DELETE CASCADE,
    end_to_end_id VARCHAR(64),
    transaction_id UUID,
    amount NUMERIC(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    value_date TIMESTAMP,
    counterparty_iban VARCHAR(64),
    counterparty_name VARCHAR(255),
    reference VARCHAR(255),
    match_status VARCHAR(20) NOT NULL,
    discrepancy_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_recon_entry_recon ON reconciliation_entries(reconciliation_id);
CREATE INDEX idx_recon_entry_status ON reconciliation_entries(match_status);
CREATE INDEX idx_recon_entry_tx ON reconciliation_entries(transaction_id);
