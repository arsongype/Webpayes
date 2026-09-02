package com.paymentplatform.payment.gateway;

import com.paymentplatform.payment.enums.PaymentProvider;

public interface PaymentGateway {
    GatewayChargeResult charge(String token, Double amount, String currency, String description);

    default GatewayChargeResult chargeWith3ds(String token, Double amount, String currency, String description) {
        return charge(token, amount, currency, description + " [3DS2]");
    }

    PaymentProvider getProvider();
}
