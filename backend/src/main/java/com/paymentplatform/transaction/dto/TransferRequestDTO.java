package com.paymentplatform.transaction.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class TransferRequestDTO {
    @NotNull(message = "L'identifiant du compte émetteur est requis")
    private String senderAccountId;

    // receiverAccountId may be a UUID for internal transfers or a phone/identifier for external operators
    private String receiverAccountId;

    // Optional: operator for external mobile money transfers (mvola, airtel, orange)
    private String receiverOperator;

    @NotNull(message = "Le montant est requis")
    @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à 0")
    private BigDecimal amount;

    @Size(max = 255, message = "La description ne peut pas dépasser 255 caractères")
    private String description;

    @Size(min = 6, max = 6, message = "Le code 2FA doit être sur 6 chiffres")
    private String twoFactorCode;

    // Backwards-compatible constructor for tests and older callers that passed receiver as UUID
    public TransferRequestDTO(java.util.UUID senderAccountId, java.util.UUID receiverAccountId, java.math.BigDecimal amount, String description) {
        this.senderAccountId = senderAccountId != null ? senderAccountId.toString() : null;
        this.receiverAccountId = receiverAccountId != null ? receiverAccountId.toString() : null;
        this.receiverOperator = null;
        this.amount = amount;
        this.description = description;
    }
}