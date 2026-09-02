package com.paymentplatform.payout.dto;

import com.paymentplatform.payout.entity.Payout;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class PayoutDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePayoutRequest {
        @NotNull
        private UUID accountId;

        @NotNull
        @DecimalMin(value = "0.01", message = "Le montant doit être supérieur à zéro")
        private BigDecimal amount;

        @NotNull
        private Payout.DestinationType destinationType;

        @NotNull
        @Size(min = 4, max = 64)
        private String destinationReference;

        @Size(max = 128)
        private String destinationName;

        @Size(max = 16)
        private String bankCode;

        @Size(max = 34)
        private String iban;

        @Size(max = 11)
        private String bic;

        @Size(max = 3)
        @Builder.Default
        private String currency = "MGA";
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayoutResponse {
        private UUID id;
        private UUID merchantId;
        private UUID accountId;
        private BigDecimal amount;
        private String currency;
        private Payout.DestinationType destinationType;
        private String destinationReference;
        private String destinationName;
        private String bankCode;
        private String iban;
        private String bic;
        private Payout.PayoutStatus status;
        private String externalId;
        private String failureReason;
        private String provider;
        private Instant scheduledAt;
        private Instant executedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public static PayoutResponse from(Payout p) {
            return PayoutResponse.builder()
                .id(p.getId())
                .merchantId(p.getMerchantId())
                .accountId(p.getAccountId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .destinationType(p.getDestinationType())
                .destinationReference(p.getDestinationReference())
                .destinationName(p.getDestinationName())
                .bankCode(p.getBankCode())
                .iban(p.getIban())
                .bic(p.getBic())
                .status(p.getStatus())
                .externalId(p.getExternalId())
                .failureReason(p.getFailureReason())
                .provider(p.getProvider())
                .scheduledAt(p.getScheduledAt())
                .executedAt(p.getExecutedAt())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayoutSummary {
        private long total;
        private long pending;
        private long processing;
        private long completed;
        private long failed;
        private java.math.BigDecimal totalAmount;
        private java.math.BigDecimal completedAmount;
    }
}
