package com.paymentplatform.account.dto;

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
public class AccountDTO {
    private UUID id;
    private UUID userId;
    private String accountNumber;
    private BigDecimal balance;
    private String currency;
    private String kycStatus;
    private Instant createdAt;
}
