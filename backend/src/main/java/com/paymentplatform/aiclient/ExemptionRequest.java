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
public class ExemptionRequest {
    private String transactionId;
    private Double amount;
    private String currency;
    private String senderAccountId;
    private String receiverAccountId;
    private Boolean isOneClick;
    private Boolean previousTransactionSuccess;
    private String previousTransactionId;
    private Double fraudScore;
    private Map<String, Object> metadata;
}
