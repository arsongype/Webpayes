package com.paymentplatform.merchant.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequest {
    @NotNull
    private UUID senderAccountId;

    private String receiverOperator;

    private String receiverAccountId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    private String description;
}
