ALTER TABLE ledger_entries DROP CONSTRAINT IF EXISTS ledger_entries_transaction_id_fkey;
COMMENT ON COLUMN ledger_entries.transaction_id IS 'References transaction for audit; may be a payment transaction_id without a transactions table row for gateway payments';
