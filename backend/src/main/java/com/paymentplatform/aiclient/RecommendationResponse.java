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
public class RecommendationResponse {
    private String user_id;
    private String savings_tip;
    private String spending_alert;
    private Map<String, Double> suggested_budget;
    private String recommended_channel;
    private Double confidence;
}
