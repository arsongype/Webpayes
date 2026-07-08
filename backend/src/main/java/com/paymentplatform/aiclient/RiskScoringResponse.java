package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskScoringResponse {
    private String transactionId;
    private double riskScore;
    private String riskLevel;
    private String recommendation;
    private BigDecimal maxRecommendedAmount;
}