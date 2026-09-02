package com.paymentplatform.aiclient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExemptionClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.routing.url:default://127.0.0.1:8001}")
    private String exemptionUrl;

    public ExemptionResponse evaluateExemption(ExemptionRequest request) {
        log.info("Requesting 3DS2 TRA exemption evaluation from: {}", exemptionUrl);
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(exemptionUrl + "/api/exemption/3ds2")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ExemptionResponse.class)
                    .timeout(Duration.ofMillis(100))
                    .onErrorResume(e -> Mono.just(ExemptionResponse.builder()
                            .transactionId(request.getTransactionId())
                            .exemptionGranted(false)
                            .reason("Service indisponible")
                            .build()))
                    .block();
        } catch (Exception e) {
            log.warn("Exemption evaluation failed: {}", e.getMessage());
            return ExemptionResponse.builder()
                    .transactionId(request.getTransactionId())
                    .exemptionGranted(false)
                    .reason("Erreur service IA")
                    .build();
        }
    }
}
