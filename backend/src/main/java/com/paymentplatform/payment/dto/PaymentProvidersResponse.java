package com.paymentplatform.payment.dto;

import com.paymentplatform.payment.enums.PaymentMethodType;
import com.paymentplatform.payment.enums.PaymentProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProvidersResponse {
    private PaymentProvider[] cardProviders;
    private PaymentMethodType[] methodTypes;
}
