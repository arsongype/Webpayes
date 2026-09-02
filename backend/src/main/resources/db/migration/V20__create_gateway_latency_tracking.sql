-- V20: Gateway latency and failure rate tracking for ML training
CREATE TABLE IF NOT EXISTS gateway_latency_history (
    id BIGSERIAL PRIMARY KEY,
    gateway_name VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100),
    latency_ms INTEGER NOT NULL,
    success BOOLEAN NOT NULL,
    amount DECIMAL(19,2),
    currency VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gateway_latency_gw ON gateway_latency_history(gateway_name);
CREATE INDEX IF NOT EXISTS idx_gateway_latency_ts ON gateway_latency_history(created_at DESC);
