package com.paymentplatform.payment.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentRequest {
    private String token;
    private String merchantApiKey;
    private PaymentMethodType paymentMethod;
    private PaymentProvider provider;
    private Double amount;
    private String currency;
    private String customerId;

    private String mobileMoneyPhone;
    private com.paymentplatform.payment.enums.MobileMoneyOperator mobileMoneyOperator;

    private String cardHolderName;

    private String destinationAccount;
    private String description;

    private String previousTransactionId;

    private String threeDsAuthCode;

    private Boolean isOneClick;
}
