package com.paymentplatform.operator.mock;

import com.paymentplatform.operator.OperatorClient;
import com.paymentplatform.operator.OperatorResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;

@Component("orange")
@Profile("mock-operators")
public class MockOrangeClient implements OperatorClient {

    @Override
    public OperatorResponse sendPayout(String to, BigDecimal amount, String currency, Map<String, String> metadata) {
        // Simulate success for dev/testing
        return new OperatorResponse(true, "MOCK-ORANGE-" + System.currentTimeMillis(), "Simulated Orange payout successful");
    }

    @Override
    public String getOperatorKey() {
        return "orange";
    }
}
