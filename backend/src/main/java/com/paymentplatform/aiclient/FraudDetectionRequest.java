package com.paymentplatform.aiclient;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudDetectionRequest {
    @NotNull
    private String transactionId;
    @NotNull
    @Positive
    private BigDecimal amount;
    @NotNull
    private String currency;
    @NotNull
    private String senderAccountId;
    @NotNull
    private String receiverAccountId;
    private Map<String, Object> metadata;
}