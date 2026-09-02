package com.paymentplatform.payment.dto;

import com.paymentplatform.payment.enums.PaymentMethodType;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private UUID paymentId;
    private PaymentStatus status;
    private String transactionReference;
    private Double amount;
    private String currency;
    private PaymentMethodType paymentMethod;
    private PaymentProvider provider;
    private String message;
    private boolean success;
    private String token;
    private String externalTransactionId;
    private Double riskScore;
    private boolean threeDsRequired;
    private String riskLevel;
    private String fraudRecommendation;
    private boolean fallbackUsed;
    private String fallbackFromProvider;
    private String fallbackToProvider;
}
