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
public class RiskScoringClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.risk-scoring.url:http://localhost:8002}")
    private String riskScoringUrl;

    public RiskScoringResponse score(RiskScoringRequest request) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(riskScoringUrl + "/api/risk/score")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RiskScoringResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> {
                        return Mono.just(RiskScoringResponse.builder()
                                .transactionId(request.getTransactionId())
                                .riskScore(0.0)
                                .riskLevel("LOW")
                                .recommendation("Service indisponible")
                                .build());
                    })
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
}