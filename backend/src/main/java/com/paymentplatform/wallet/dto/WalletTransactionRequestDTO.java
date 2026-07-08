package com.paymentplatform.wallet.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record WalletTransactionRequestDTO(
        @NotNull(message = "L'identifiant du compte est requis")
        java.util.UUID accountId,
        @NotNull(message = "Le montant est requis")
        @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
        BigDecimal amount,
        @NotBlank(message = "La description est requise")
        String description
) {
}
