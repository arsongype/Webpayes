package com.paymentplatform.paymentmethod.dto;

import com.paymentplatform.paymentmethod.entity.PaymentMethodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodResponseDTO {
    private UUID id;
    private UUID userId;
    private PaymentMethodType type;
    private String provider;
    private String accountNumber;
    private String expiryDate;
    private boolean isFavorite;
    private boolean isActive;
    private Instant createdAt;
}
