package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutingResponse {
    private String recommended_channel;
    private String reason;
    private Double estimated_fee;
    private Integer estimated_arrival_seconds;
    private List<Map<String, Object>> alternatives;
}
