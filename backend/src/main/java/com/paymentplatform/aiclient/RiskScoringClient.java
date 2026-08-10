package com.paymentplatform.aiclient;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;

@Component
@RequiredArgsConstructor
public class RiskScoringClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.risk-scoring.url:http://localhost:8002}")
    private String riskScoringUrl;

    public RiskScoringResponse score(@NonNull RiskScoringRequest request) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(riskScoringUrl + "/api/risk/score")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RiskScoringResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofSeconds(1)))
                    .onErrorResume(e -> Mono.just(RiskScoringResponse.builder()
                            .transactionId(request.getTransactionId())
                            .riskScore(0.0)
                            .riskLevel("LOW")
                            .recommendation("Service indisponible")
                            .build()))
                    .block();
        } catch (Exception e) {
            return RiskScoringResponse.builder()
                    .transactionId(request.getTransactionId())
                    .riskScore(0.0)
                    .riskLevel("LOW")
                    .recommendation("Erreur service IA")
                    .build();
        }
    }

    public RiskScoringResponse getScore(String transactionId) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.GET)
                    .uri(riskScoringUrl + "/api/risk/score/" + transactionId)
                    .retrieve()
                    .bodyToMono(RiskScoringResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofSeconds(1)))
                    .onErrorResume(e -> Mono.just(RiskScoringResponse.builder()
                            .transactionId(transactionId)
                            .riskScore(0.0)
                            .riskLevel("LOW")
                            .recommendation("Service indisponible")
                            .build()))
                    .block();
        } catch (Exception e) {
            return RiskScoringResponse.builder()
                    .transactionId(transactionId)
                    .riskScore(0.0)
                    .riskLevel("LOW")
                    .recommendation("Erreur service IA")
                    .build();
        }
    }
}