-- V3__add_account_kyc.sql
-- Ajout du statut KYC sur les comptes (vérifié via le service IA kyc-verification).

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) NOT NULL DEFAULT 'NOT_VERIFIED';
