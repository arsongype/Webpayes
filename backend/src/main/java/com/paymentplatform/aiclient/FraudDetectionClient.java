package com.paymentplatform.aiclient;

import com.paymentplatform.transaction.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class FraudDetectionClient {

    private final WebClient.Builder webClientBuilder;
    private final RiskScoringClient riskScoringClient;

    @Value("${ai.fraud-detection.url:http://localhost:8001}")
    private String fraudDetectionUrl;

    public FraudDetectionResponse analyze(FraudDetectionRequest request) {
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
                                .isFraudulent(false)
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
                    .isFraudulent(false)
                    .fraudScore(0.0)
                    .riskLevel("LOW")
                    .recommendation("Erreur service IA")
                    .build();
        }
    }
}