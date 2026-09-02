-- Sprint 3: Agent transaction audit log (US02.4 - immutable, auditable)
CREATE TABLE agent_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    transaction_ref VARCHAR(64) NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    budget_before_daily DECIMAL(19,4) NOT NULL,
    budget_before_monthly DECIMAL(19,4) NOT NULL,
    budget_after_daily DECIMAL(19,4) NOT NULL,
    budget_after_monthly DECIMAL(19,4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_txn_agent_id ON agent_transactions(agent_id);
CREATE INDEX idx_agent_txn_ref ON agent_transactions(transaction_ref);

-- Data audit trail for agent spending (immutable log)
CREATE TABLE agent_budget_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    budget_daily_before DECIMAL(19,4) NOT NULL,
    budget_daily_after DECIMAL(19,4) NOT NULL,
    budget_monthly_before DECIMAL(19,4) NOT NULL,
    budget_monthly_after DECIMAL(19,4) NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_agent_budget_audit_agent_id ON agent_budget_audit(agent_id);
