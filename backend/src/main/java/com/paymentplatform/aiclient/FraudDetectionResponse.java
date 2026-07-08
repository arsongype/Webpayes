package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudDetectionResponse {
    private String transactionId;
    private boolean isFraudulent;
    private double fraudScore;
    private String riskLevel;
    private String recommendation;
    private Map<String, Object> details;
}