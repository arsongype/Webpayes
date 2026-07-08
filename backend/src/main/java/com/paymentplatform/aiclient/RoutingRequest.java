package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutingRequest {
    private Double amount;
    private String currency;
    private String sender_country;
    private String receiver_country;
    private Integer urgency_seconds;
    private String preferred_channel;
}
