package com.paymentplatform.resilience;

import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.gateway.GatewayChargeResult;
import com.paymentplatform.payment.gateway.PaymentGateway;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.extern.slf4j.Slf4j;

import java.util.function.Supplier;

@Slf4j
public class CircuitBreakerGateway implements PaymentGateway {

    private final PaymentGateway delegate;
    private final CircuitBreaker circuitBreaker;

    public CircuitBreakerGateway(PaymentGateway delegate, CircuitBreakerRegistry circuitBreakerRegistry) {
        this.delegate = delegate;
        this.circuitBreaker = circuitBreakerRegistry.circuitBreaker(delegate.getProvider().name());
    }

    @Override
    public GatewayChargeResult charge(String token, Double amount, String currency, String description) {
        Supplier<GatewayChargeResult> decoratedSupplier = CircuitBreaker.decorateSupplier(circuitBreaker,
                () -> delegate.charge(token, amount, currency, description));

        GatewayChargeResult result = decoratedSupplier.get();
        log.info("Gateway {} charge result: success={}, latency={}ms, circuitState={}",
                delegate.getProvider(), result.success(), result.latencyMs(), circuitBreaker.getState());
        return result;
    }

    @Override
    public GatewayChargeResult chargeWith3ds(String token, Double amount, String currency, String description) {
        Supplier<GatewayChargeResult> decoratedSupplier = CircuitBreaker.decorateSupplier(circuitBreaker,
                () -> delegate.chargeWith3ds(token, amount, currency, description));

        return decoratedSupplier.get();
    }

    @Override
    public PaymentProvider getProvider() {
        return delegate.getProvider();
    }

    public CircuitBreaker getCircuitBreaker() {
        return circuitBreaker;
    }
}
