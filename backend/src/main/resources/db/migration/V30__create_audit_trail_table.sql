-- V30__create_audit_trail_table.sql
-- PCI-DSS Requirement 10: Track and monitor all access to network resources and cardholder data
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY,
    event_time TIMESTAMP NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'INFO',
    actor_id UUID,
    actor_email VARCHAR(255),
    actor_ip VARCHAR(64),
    user_agent VARCHAR(512),
    request_id VARCHAR(64),
    trace_id VARCHAR(64),
    resource_type VARCHAR(64),
    resource_id VARCHAR(128),
    action VARCHAR(64) NOT NULL,
    outcome VARCHAR(16) NOT NULL DEFAULT 'SUCCESS',
    description TEXT,
    metadata JSONB,
    prev_hash VARCHAR(128),
    hash_chain VARCHAR(128) NOT NULL,
    retention_until TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_audit_severity CHECK (severity IN ('INFO','WARN','ERROR','CRITICAL')),
    CONSTRAINT chk_audit_outcome CHECK (outcome IN ('SUCCESS','FAILURE','DENIED','PARTIAL'))
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_events(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_events(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_event_time ON audit_events(event_time);
CREATE INDEX IF NOT EXISTS idx_audit_outcome ON audit_events(outcome);
CREATE INDEX IF NOT EXISTS idx_audit_retention ON audit_events(retention_until);
