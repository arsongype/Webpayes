package com.paymentplatform.payment.gateway;

import com.paymentplatform.payment.enums.MobileMoneyOperator;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.extern.slf4j.Slf4j;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;

@Slf4j
@Component
public class OrangeMoneyGateway implements PaymentGateway {

    private final WebClient webClient;
    private final String merchantKey;

    public OrangeMoneyGateway(
            @Value("${payment.gateway.orange-money.api-url:https://api.orange.com}") String apiUrl,
            @Value("${payment.gateway.orange-money.client-id:}") String clientId,
            @Value("${payment.gateway.orange-money.client-secret:}") String clientSecret,
            @Value("${payment.gateway.orange-money.merchant-key:}") String merchantKey) {

        this.merchantKey = merchantKey;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public GatewayChargeResult charge(String phone, Double amount, String currency, String description) {
        long start = System.nanoTime();
        if (merchantKey == null || merchantKey.isBlank()) {
            log.warn("Orange Money merchant key not configured; using simulation");
            return new GatewayChargeResult(true, "sim-om-" + System.nanoTime(),
                    "USSD push simulé envoyé au " + phone + " (configurez ORANGE_MONEY_MERCHANT_KEY pour l'API réelle). Veuillez saisir le code OTP.",
                    null, (System.nanoTime() - start) / 1_000_000);
        }

        try {
            OrangeMoneyPaymentRequest request = OrangeMoneyPaymentRequest.builder()
                    .merchantKey(merchantKey)
                    .paymentMethod(" OrangeMoneyCI ")
                    .callbackUrl("")
                    .cancelUrl("")
                    .returnUrl("")
                    .amount(new BigDecimal(amount.toString()).multiply(BigDecimal.valueOf(1000)).longValue())
                    .currency(currency)
                    .targetAccountIdentifier(phone)
                    .message(description)
                    .build();

            OrangeMoneyPaymentResponse response = webClient.post()
                    .uri("/api/webpayment/payment")
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .onStatus(status -> status.isError(), resp -> {
                        log.error("Orange Money API returned error status: {}", resp.statusCode());
                        return Mono.error(new RuntimeException("Orange Money API error: " + resp.statusCode()));
                    })
                    .bodyToMono(OrangeMoneyPaymentResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null && response.isSuccess()) {
                log.info("Orange Money payment initiated: externalId={}, status={}", response.getPaymentId(), response.getStatus());
                return new GatewayChargeResult(true, response.getPaymentId(),
                        "USSD push envoyé au " + phone + ". Statut: " + response.getStatus(), null,
                        (System.nanoTime() - start) / 1_000_000);
            } else {
                String msg = response != null ? response.getMessage() : "No response from Orange Money API";
                log.warn("Orange Money payment failed: {}", msg);
                return new GatewayChargeResult(false, response != null ? response.getPaymentId() : null, msg, "payment_failed",
                        (System.nanoTime() - start) / 1_000_000);
            }
        } catch (Exception e) {
            log.error("Orange Money payment error", e);
            return new GatewayChargeResult(false, null,
                    "Erreur lors de l'appel à l'API Orange Money: " + e.getMessage(), "api_error",
                    (System.nanoTime() - start) / 1_000_000);
        }
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.ORANGE_MONEY;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrangeMoneyPaymentRequest {
        @JsonProperty("merchant_key")
        private String merchantKey;

        @JsonProperty("payment_method")
        private String paymentMethod;

        @JsonProperty("callback_url")
        private String callbackUrl;

        @JsonProperty("cancel_url")
        private String cancelUrl;

        @JsonProperty("return_url")
        private String returnUrl;

        @JsonProperty("amount")
        private Long amount;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("target_account_identifier")
        private String targetAccountIdentifier;

        @JsonProperty("message")
        private String message;
    }

    @Data
    public static class OrangeMoneyPaymentResponse {
        @JsonProperty("payment_id")
        private String paymentId;

        @JsonProperty("status")
        private String status;

        @JsonProperty("message")
        private String message;

        @JsonProperty("success")
        private boolean success;
    }
}
