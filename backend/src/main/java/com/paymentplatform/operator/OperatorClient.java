package com.paymentplatform.operator;

import java.math.BigDecimal;
import java.util.Map;

public interface OperatorClient {
    OperatorResponse sendPayout(String to, BigDecimal amount, String currency, Map<String, String> metadata);
    String getOperatorKey();
}
