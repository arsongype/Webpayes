-- V1__init_schema.sql
-- Schéma initial : utilisateurs et comptes (Sprint 1)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    oauth_provider  VARCHAR(30),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    account_number  VARCHAR(34) NOT NULL UNIQUE,
    balance         NUMERIC(19,4) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'MGA',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
