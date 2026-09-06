package com.paymentplatform.transaction.dto;

import com.paymentplatform.transaction.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private UUID id;
    private UUID senderAccountId;
    private UUID receiverAccountId;
    private BigDecimal amount;
    private String currency;
    private TransactionStatus status;
    private String reference;
    private String metadata;
    private Double fraudScore;
    private Double riskScore;
    private Instant createdAt;
    private Instant updatedAt;
    private String type;
}