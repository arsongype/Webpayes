package com.paymentplatform.account.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AccountRequestDTO(
        UUID userId,
        String accountNumber,
        BigDecimal balance,
        String currency
) {
}
