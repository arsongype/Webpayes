-- V21: Fix expiry_year column length (was varchar(2), needs varchar(4) for year "2027")
ALTER TABLE vault_tokens ALTER COLUMN expiry_year TYPE VARCHAR(4);

-- Fix expiry_month for consistency (ensure 2-char)
ALTER TABLE vault_tokens ALTER COLUMN expiry_month TYPE VARCHAR(2);
