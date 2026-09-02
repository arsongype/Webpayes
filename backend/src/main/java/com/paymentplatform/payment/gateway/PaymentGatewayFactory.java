package com.paymentplatform.payment.gateway;

import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.resilience.CircuitBreakerGateway;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentGatewayFactory {

    private final List<PaymentGateway> gateways;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    @Value("${payment.gateway.mode:mock}")
    private String gatewayMode;

    private final ConcurrentHashMap<String, CircuitBreakerGateway> wrappedGateways = new ConcurrentHashMap<>();

    private PaymentGateway wrapWithCircuitBreaker(PaymentGateway gateway) {
        String key = gateway.getProvider().name();
        return wrappedGateways.computeIfAbsent(key, k -> new CircuitBreakerGateway(gateway, circuitBreakerRegistry));
    }

    public Optional<PaymentGateway> byProvider(PaymentProvider provider) {
        if (provider == null) return getActiveGateway();

        return gateways.stream()
                .filter(g -> g.getProvider() == provider)
                .findFirst()
                .map(this::wrapWithCircuitBreaker);
    }

    public Optional<PaymentGateway> getActiveGateway() {
        if ("stripe".equalsIgnoreCase(gatewayMode)) {
            return gateways.stream()
                    .filter(g -> g.getProvider() == PaymentProvider.STRIPE)
                    .findFirst()
                    .map(this::wrapWithCircuitBreaker);
        }
        return gateways.stream()
                .filter(g -> g.getProvider() == PaymentProvider.VISA)
                .findFirst()
                .map(this::wrapWithCircuitBreaker);
    }

    public Optional<CircuitBreakerGateway> getCircuitBreakerGateway(PaymentProvider provider) {
        return Optional.ofNullable(wrappedGateways.get(provider.name()));
    }
}
