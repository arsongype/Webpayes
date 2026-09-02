ALTER TABLE ledger_entries DROP CONSTRAINT IF EXISTS ledger_entries_account_id_fkey;
COMMENT ON COLUMN ledger_entries.account_id IS 'References account for audit; may be used for payment processing without accounts table row';
