package com.paymentplatform.resilience;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
public class CircuitBreakerHealthIndicator implements HealthIndicator {

    private final CircuitBreakerRegistry circuitBreakerRegistry;

    public CircuitBreakerHealthIndicator(CircuitBreakerRegistry circuitBreakerRegistry) {
        this.circuitBreakerRegistry = circuitBreakerRegistry;
    }

    @Override
    public Health health() {
        Set<CircuitBreaker> breakers = circuitBreakerRegistry.getAllCircuitBreakers();
        Map<String, String> states = new HashMap<>();
        for (CircuitBreaker cb : breakers) {
            states.put(cb.getName(), cb.getState().name());
        }

        boolean anyOpen = states.values().stream().anyMatch(s -> s.equals("OPEN"));

        return Health.up()
                .withDetail("circuitBreakers", states)
                .withDetail("anyOpen", anyOpen)
                .build();
    }
}
