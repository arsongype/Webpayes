package com.paymentplatform.aiclient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class FraudDetectionResponse {
    private String transactionId;
    @JsonProperty("isFraudulent")
    private boolean fraudulent;
    private double fraudScore;
    private String riskLevel;
    private String recommendation;
    private Map<String, Object> details;
}