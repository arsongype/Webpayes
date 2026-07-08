package com.paymentplatform.wallet.dto;

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
public class WalletTransactionDTO {
    private UUID id;
    private UUID accountId;
    private String type;
    private BigDecimal amount;
    private String currency;
    private String description;
    private Instant createdAt;
}
