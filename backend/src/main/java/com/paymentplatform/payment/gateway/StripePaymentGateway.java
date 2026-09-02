package com.paymentplatform.payment.gateway;

import com.paymentplatform.payment.enums.PaymentProvider;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class StripePaymentGateway implements PaymentGateway {

    @Value("${payment.gateway.stripe.api-key:}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.isBlank()) {
            Stripe.apiKey = apiKey;
        }
    }

    @Override
    public GatewayChargeResult charge(String token, Double amount, String currency, String description) {
        long start = System.nanoTime();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Stripe API key not configured; falling back to simulation");
            return new GatewayChargeResult(true, "sim-" + System.nanoTime(),
                    "Simulated Stripe charge (configure STRIPE_API_KEY for real gateway)", null,
                    (System.nanoTime() - start) / 1_000_000);
        }

        try {
            Map<String, Object> params = new HashMap<>();
            params.put("amount", (long) (amount * 100));
            params.put("currency", currency.toLowerCase());
            params.put("source", token);
            params.put("description", description);
            params.put("capture", true);

            PaymentIntent intent = PaymentIntent.create(params);

            if (intent.getStatus().equals("succeeded") || intent.getStatus().equals("requires_capture")) {
                return new GatewayChargeResult(true, intent.getId(),
                        "Paiement Stripe accepté (statut: " + intent.getStatus() + ")", null,
                        (System.nanoTime() - start) / 1_000_000);
            } else {
                return new GatewayChargeResult(false, intent.getId(),
                        "Paiement Stripe en attente de confirmation (statut: " + intent.getStatus() + ")", "requires_action",
                        (System.nanoTime() - start) / 1_000_000);
            }
        } catch (StripeException e) {
            log.error("Stripe charge failed", e);
            return new GatewayChargeResult(false, null,
                    e.getMessage(), e.getCode(),
                    (System.nanoTime() - start) / 1_000_000);
        }
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.STRIPE;
    }
}
