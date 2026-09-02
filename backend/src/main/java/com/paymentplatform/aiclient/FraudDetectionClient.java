package com.paymentplatform.aiclient;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class FraudDetectionClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.fraud-detection.url:http://127.0.0.1:8001}")
    private String fraudDetectionUrl;

    public FraudDetectionResponse analyze(@NonNull FraudDetectionRequest request) {
        log.info("Calling fraud detection at: {}/api/fraud/detect", fraudDetectionUrl);
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(fraudDetectionUrl + "/api/fraud/detect")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(FraudDetectionResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        return Mono.just(FraudDetectionResponse.builder()
                                .transactionId(request.getTransactionId())
                                .fraudulent(false)
                                .fraudScore(0.0)
                                .riskLevel("LOW")
                                .recommendation("Service indisponible - analyse par défaut")
                                .details(Map.of("error", e.getMessage()))
                                .build());
                    })
                    .block();
        } catch (Exception e) {
            return FraudDetectionResponse.builder()
                    .transactionId(request.getTransactionId())
                    .fraudulent(false)
                    .fraudScore(0.0)
                    .riskLevel("LOW")
                    .recommendation("Erreur service IA")
                    .build();
        }
    }

    public java.util.List<FraudDetectionResponse> getRecentAlerts() {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.GET)
                    .uri(fraudDetectionUrl + "/api/fraud/alerts")
                    .retrieve()
                    .bodyToFlux(FraudDetectionResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .collectList()
                    .block();
        } catch (Exception e) {
            return List.of();
        }
    }

    public FraudDetectionResponse analyzeById(String transactionId) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(fraudDetectionUrl + "/api/fraud/analyze/" + transactionId)
                    .bodyValue(Map.of("transaction_id", transactionId))
                    .retrieve()
                    .bodyToMono(FraudDetectionResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> Mono.just(FraudDetectionResponse.builder()
                            .transactionId(transactionId)
                            .fraudulent(false)
                            .fraudScore(0.0)
                            .riskLevel("LOW")
                            .recommendation("Service indisponible")
                            .build()))
                    .block();
        } catch (Exception e) {
            return FraudDetectionResponse.builder()
                    .transactionId(transactionId)
                    .fraudulent(false)
                    .fraudScore(0.0)
                    .riskLevel("LOW")
                    .recommendation("Erreur service IA")
                    .build();
        }
    }
}
