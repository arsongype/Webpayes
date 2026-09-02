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
public class MPesaGateway implements PaymentGateway {

    private final WebClient webClient;
    private final String businessShortCode;
    private final String consumerKey;
    private final String consumerSecret;
    private final String partyA;

    public MPesaGateway(
            @Value("${payment.gateway.mpesa.api-url:https://api.safaricom.co.ke}") String apiUrl,
            @Value("${payment.gateway.mpesa.business-short-code:}") String businessShortCode,
            @Value("${payment.gateway.mpesa.consumer-key:}") String consumerKey,
            @Value("${payment.gateway.mpesa.consumer-secret:}") String consumerSecret,
            @Value("${payment.gateway.mpesa.party-a:}") String partyA) {

        this.businessShortCode = businessShortCode;
        this.consumerKey = consumerKey;
        this.consumerSecret = consumerSecret;
        this.partyA = partyA;
        this.webClient = WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public GatewayChargeResult charge(String phone, Double amount, String currency, String description) {
        long start = System.nanoTime();
        if (consumerKey == null || consumerKey.isBlank()) {
            log.warn("M-Pesa credentials not configured; using simulation");
            return new GatewayChargeResult(true, "sim-mpesa-" + System.nanoTime(),
                    "STK push simulé envoyé au " + phone + " (configurez MPESA_CONSUMER_KEY pour l'API réelle). Veuillez saisir le code PIN sur votre téléphone.",
                    null, (System.nanoTime() - start) / 1_000_000);
        }

        try {
            String accessToken = getAccessToken();

            MPesaPaymentRequest request = MPesaPaymentRequest.builder()
                    .businessShortCode(businessShortCode)
                    .partyA(phone)
                    .amount(new BigDecimal(amount.toString()).setScale(0, BigDecimal.ROUND_HALF_UP).longValue())
                    .partyB(businessShortCode)
                    .remarks(description)
                    .queueDestinationURL("")
                    .build();

            MPesaPaymentResponse response = webClient.post()
                    .uri("/mpesa/stkpush/v1/processrequest")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .body(BodyInserters.fromValue(request))
                    .retrieve()
                    .onStatus(status -> status.isError(), resp -> {
                        log.error("M-Pesa API returned error status: {}", resp.statusCode());
                        return Mono.error(new RuntimeException("M-Pesa API error: " + resp.statusCode()));
                    })
                    .bodyToMono(MPesaPaymentResponse.class)
                    .timeout(Duration.ofSeconds(15))
                    .block();

            if (response != null) {
                log.info("M-Pesa STK push sent: checkoutRequestID={}, responseCode={}", response.getCheckoutRequestId(), response.getResponseCode());
                return new GatewayChargeResult(true, response.getCheckoutRequestId(),
                        "STK push envoyé au " + phone + ". Veuillez confirmer le paiement sur votre téléphone.", null,
                        (System.nanoTime() - start) / 1_000_000);
            } else {
                return new GatewayChargeResult(false, null, "No response from M-Pesa API", "payment_failed",
                        (System.nanoTime() - start) / 1_000_000);
            }
        } catch (Exception e) {
            log.error("M-Pesa payment error", e);
            return new GatewayChargeResult(false, null,
                    "Erreur lors de l'appel à l'API M-Pesa: " + e.getMessage(), "api_error",
                    (System.nanoTime() - start) / 1_000_000);
        }
    }

    private String getAccessToken() {
        String credentials = consumerKey + ":" + consumerSecret;
        String encoded = java.util.Base64.getEncoder().encodeToString(credentials.getBytes());

        MPesaTokenResponse tokenResponse = webClient.post()
                .uri("//oauth/v1/generate?grant_type=client_credentials")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + encoded)
                .retrieve()
                .bodyToMono(MPesaTokenResponse.class)
                .timeout(Duration.ofSeconds(10))
                .block();

        return tokenResponse != null ? tokenResponse.getAccessToken() : "";
    }

    @Override
    public PaymentProvider getProvider() {
        return PaymentProvider.MPESA;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MPesaPaymentRequest {
        @JsonProperty("BusinessShortCode")
        private String businessShortCode;

        @JsonProperty("PartyA")
        private String partyA;

        @JsonProperty("Amount")
        private Long amount;

        @JsonProperty("PartyB")
        private String partyB;

        @JsonProperty("Remarks")
        private String remarks;

        @JsonProperty("QueueDestinationURL")
        private String queueDestinationURL;

        @JsonProperty("CallbackURL")
        private String callbackURL;
    }

    @Data
    public static class MPesaPaymentResponse {
        @JsonProperty("CheckoutRequestID")
        private String checkoutRequestId;

        @JsonProperty("ResponseCode")
        private String responseCode;

        @JsonProperty("ResponseDescription")
        private String responseDescription;

        @JsonProperty("CustomerMessage")
        private String customerMessage;
    }

    @Data
    public static class MPesaTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("expires_in")
        private String expiresIn;
    }
}
