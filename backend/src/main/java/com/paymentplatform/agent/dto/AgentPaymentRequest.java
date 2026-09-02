package com.paymentplatform.agent.dto;

import com.paymentplatform.payment.enums.PaymentMethodType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentPaymentRequest {
    private String paymentMethod;
    private Double amount;
    private String currency;
    private String token;
    private String mobileMoneyPhone;
    private String mobileMoneyOperator;
    private String destinationAccount;
    private String provider;
    private String description;
    private String destinationEmail;
    private String destinationFirstName;
    private String destinationLastName;
    private Boolean request3ds;
    private String previousTransactionId;
    private String threeDsAuthCode;
    private Boolean isOneClick;
}
