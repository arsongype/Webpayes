package com.paymentplatform.payment.gateway;

import com.paymentplatform.payment.enums.PaymentProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MockPaymentGateway implements PaymentGateway {

    @Value("${payment.gateway.mock.simulate-success:true}")
    private boolean simulateSuccess;

    @Override
    public GatewayChargeResult charge(String token, Double amount, String currency, String description) {
        long start = System.nanoTime();
        if (!simulateSuccess) {
            return new GatewayChargeResult(false, null,
                    "Simulation échouée (simulate-success=false)", "card_declined",
                    (System.nanoTime() - start) / 1_000_000);
        }

        String cardRef = token != null ? token.substring(Math.max(0, token.length() - 8)) : "unknown";
        log.info("Mock gateway charged {} {} with token ending in {}", amount, currency, cardRef);

        return new GatewayChargeResult(true, "mock-" + System.nanoTime(),
                "Paiement simulé accepté via " + getProvider().name(), null,
                (System.nanoTime() - start) / 1_000_000);
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.VISA;
    }
}
