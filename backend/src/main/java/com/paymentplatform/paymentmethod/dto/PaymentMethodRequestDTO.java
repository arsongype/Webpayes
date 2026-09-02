package com.paymentplatform.paymentmethod.dto;

import com.paymentplatform.paymentmethod.entity.PaymentMethodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodRequestDTO {
    private PaymentMethodType type;
    private String provider;
    private String accountNumber;
    private String expiryDate;
    private Boolean isFavorite;
    private Boolean isActive;
}
