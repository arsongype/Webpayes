package com.paymentplatform.payment.gateway;

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

@Slf4j
@Component
public class MTNMobileMoneyGateway implements PaymentGateway {

    private final WebClient webClient;
    private final String subscriptionKey;

    public MTNMobileMoneyGateway(
            @Value("${payment.gateway.mtn-api.api-url:https://api.mtn.com}") String apiUrl,
            @Value("${payment.gateway.mtn-api.subscription-key:}") String subscriptionKey) {

        this.subscriptionKey = subscriptionKey;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public GatewayChargeResult charge(String phone, Double amount, String currency, String description) {
        long start = System.nanoTime();
        if (subscriptionKey == null || subscriptionKey.isBlank()) {
            log.warn("MTN Mobile Money subscription key not configured; using simulation");
            return new GatewayChargeResult(true, "sim-mtn-" + System.nanoTime(),
                    "USSD push simulé envoyé au " + phone + " (configurez MTN_API_SUBSCRIPTION_KEY pour l'API réelle). Veuillez saisir le code OTP.",
                    null, (System.nanoTime() - start) / 1_000_000);
        }

        try {
            MTNPaymentRequest request = MTNPaymentRequest.builder()
                    .amount(new BigDecimal(amount.toString()).multiply(BigDecimal.valueOf(1000)).longValue())
                    .currency(currency)
                    .payer(Payer.builder().msisdn(phone).build())
                    .payerMessage(description)
                    .payeeNote("Paiement WebPaysh")
                    .build();

            MTNPaymentResponse response = webClient.post()
                    .uri("/disbursement/v1_0/send-money")
                    .header("Ocp-Apim-Subscription-Key", subscriptionKey)
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .onStatus(status -> status.isError(), resp -> {
                        log.error("MTN API returned error status: {}", resp.statusCode());
                        return Mono.error(new RuntimeException("MTN API error: " + resp.statusCode()));
                    })
                    .bodyToMono(MTNPaymentResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null) {
                log.info("MTN payment initiated: reference={}, status={}", response.getReference(), response.getStatus());
                return new GatewayChargeResult(true, response.getReference(),
                        "Paiement MTN envoyé au " + phone + ". Statut: " + response.getStatus(), null,
                        (System.nanoTime() - start) / 1_000_000);
            } else {
                return new GatewayChargeResult(false, null, "No response from MTN API", "payment_failed",
                        (System.nanoTime() - start) / 1_000_000);
            }
        } catch (Exception e) {
            log.error("MTN payment error", e);
            return new GatewayChargeResult(false, null,
                    "Erreur lors de l'appel à l'API MTN: " + e.getMessage(), "api_error",
                    (System.nanoTime() - start) / 1_000_000);
        }
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.MTN_MOBILE_MONEY;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MTNPaymentRequest {
        @JsonProperty("amount")
        private Long amount;

        @JsonProperty("currency")
        private String currency;

        @JsonProperty("payer")
        private Payer payer;

        @JsonProperty("payerMessage")
        private String payerMessage;

        @JsonProperty("payeeNote")
        private String payeeNote;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payer {
        @JsonProperty("msisdn")
        private String msisdn;
    }

    @Data
    public static class MTNPaymentResponse {
        @JsonProperty("reference")
        private String reference;

        @JsonProperty("status")
        private String status;

        @JsonProperty("message")
        private String message;
    }
}
