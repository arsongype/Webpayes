package com.paymentplatform.payment.gateway;

public record GatewayChargeResult(
        boolean success,
        String externalId,
        String message,
        String failureCode,
        long latencyMs
) {
    public GatewayChargeResult(boolean success, String externalId, String message, String failureCode) {
        this(success, externalId, message, failureCode, 0);
    }
}
