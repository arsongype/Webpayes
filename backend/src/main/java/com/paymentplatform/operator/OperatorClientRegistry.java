package com.paymentplatform.operator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OperatorClientRegistry {
    private final Map<String, OperatorClient> clients;

    public OperatorClient get(String operatorKey) {
        if (operatorKey == null) return null;
        return clients.get(operatorKey.toLowerCase(Locale.ROOT));
    }
}
