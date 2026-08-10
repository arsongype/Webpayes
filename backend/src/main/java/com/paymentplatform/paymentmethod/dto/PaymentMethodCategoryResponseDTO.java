package com.paymentplatform.paymentmethod.dto;

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
public class PaymentMethodCategoryResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String icon;
    private Instant createdAt;
}
