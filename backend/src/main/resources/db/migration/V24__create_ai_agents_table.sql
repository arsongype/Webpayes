-- Sprint 3: AI Agent entities for Agentic Commerce (US02.4)
CREATE TABLE ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    api_key_hash VARCHAR(255) NOT NULL UNIQUE,
    api_key_prefix VARCHAR(20) NOT NULL UNIQUE,
    budget_daily DECIMAL(19,4) NOT NULL DEFAULT 100000,
    budget_monthly DECIMAL(19,4) NOT NULL DEFAULT 1000000,
    spent_daily DECIMAL(19,4) NOT NULL DEFAULT 0,
    spent_monthly DECIMAL(19,4) NOT NULL DEFAULT 0,
    budget_reset_at TIMESTAMP,
    owner_user_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    allowed_payment_methods VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
