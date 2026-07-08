package com.paymentplatform.wallet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletBalanceDTO {
    private String accountId;
    private BigDecimal balance;
    private String currency;
}
