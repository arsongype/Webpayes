package com.paymentplatform.payment.service;

import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentMethodType;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.exec.BankTransferExec;
import com.paymentplatform.payment.exec.CardPaymentExec;
import com.paymentplatform.payment.exec.MobileMoneyPaymentExec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final CardPaymentExec cardPaymentExec;
    private final MobileMoneyPaymentExec mobileMoneyPaymentExec;
    private final BankTransferExec bankTransferExec;

    public PaymentResponse processPayment(PaymentRequest request) {
        try {
            if (request.getPaymentMethod() == PaymentMethodType.CARD) {
                PaymentResponse cardResponse = cardPaymentExec.execute(request);

                if (cardResponse.isSuccess()) {
                    return cardResponse;
                }

                return tryFallback(request, cardResponse);
            }
            if (request.getPaymentMethod() == PaymentMethodType.MOBILE_MONEY) {
                return mobileMoneyPaymentExec.execute(request);
            }
            if (request.getPaymentMethod() == PaymentMethodType.BANK_TRANSFER) {
                return bankTransferExec.execute(request);
            }
            throw new IllegalArgumentException("Type de paiement non supporté: " + request.getPaymentMethod());
        } catch (Exception ex) {
            log.error("Payment processing failed", ex);
            return PaymentResponse.builder()
                    .paymentId(java.util.UUID.randomUUID())
                    .status(PaymentStatus.FAILED)
                    .transactionReference("ERR-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .externalTransactionId(null)
                    .amount(request != null ? request.getAmount() : 0)
                    .currency(request != null ? request.getCurrency() : "MGA")
                    .paymentMethod(request != null && request.getPaymentMethod() != null ? request.getPaymentMethod() : com.paymentplatform.payment.enums.PaymentMethodType.CARD)
                    .provider(null)
                    .message("Une erreur interne est survenue lors du paiement. Veuillez réessayer.")
                    .success(false)
                    .token(request != null ? request.getToken() : null)
                    .build();
        }
    }

    private PaymentResponse tryFallback(PaymentRequest request, PaymentResponse original) {
        log.warn("Card payment declined ({}), attempting cross-channel fallback", original.getMessage());

        if (request.getMobileMoneyPhone() != null && !request.getMobileMoneyPhone().isBlank()) {
            log.info("Fallback: trying mobile money via {}", request.getMobileMoneyOperator());
            PaymentRequest mmRequest = PaymentRequest.builder()
                    .token(request.getToken())
                    .merchantApiKey(request.getMerchantApiKey())
                    .paymentMethod(PaymentMethodType.MOBILE_MONEY)
                    .provider(request.getProvider())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .mobileMoneyPhone(request.getMobileMoneyPhone())
                    .mobileMoneyOperator(request.getMobileMoneyOperator())
                    .description("Fallback depuis paiement par carte: " + original.getTransactionReference())
                    .isOneClick(request.getIsOneClick())
                    .build();

            PaymentResponse mmResponse = mobileMoneyPaymentExec.execute(mmRequest);
            if (mmResponse.isSuccess()) {
                 mmResponse.setFallbackUsed(true);
                mmResponse.setFallbackFromProvider(original.getProvider() != null ? original.getProvider().name() : "VISA");
                mmResponse.setFallbackToProvider(mmResponse.getProvider() != null ? mmResponse.getProvider().name() : "UNKNOWN");
                log.info("Fallback succeeded: mobile money payment accepted");
                return mmResponse;
            }
        }

        if (request.getDestinationAccount() != null && !request.getDestinationAccount().isBlank()) {
            log.info("Fallback: trying bank transfer to {}", request.getDestinationAccount());
            PaymentRequest btRequest = PaymentRequest.builder()
                    .token(request.getToken())
                    .merchantApiKey(request.getMerchantApiKey())
                    .paymentMethod(PaymentMethodType.BANK_TRANSFER)
                    .provider(request.getProvider())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .destinationAccount(request.getDestinationAccount())
                    .description("Fallback depuis paiement par carte: " + original.getTransactionReference())
                    .build();

            PaymentResponse btResponse = bankTransferExec.execute(btRequest);
            if (btResponse.isSuccess()) {
                btResponse.setFallbackUsed(true);
                btResponse.setFallbackFromProvider(original.getProvider() != null ? original.getProvider().name() : "VISA");
                btResponse.setFallbackToProvider(btResponse.getProvider() != null ? btResponse.getProvider().name() : "UNKNOWN");
                log.info("Fallback succeeded: bank transfer accepted");
                return btResponse;
            }
        }

        log.warn("All fallback channels failed, returning original card decline response");
        return original;
    }
}
