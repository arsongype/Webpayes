package com.paymentplatform.aiclient;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;

@Component
@RequiredArgsConstructor
public class KycClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.kyc.url:http://localhost:8003}")
    private String kycUrl;

    public KycVerificationResponse verify(KycVerificationRequest request) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(kycUrl + "/api/kyc/verify")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(KycVerificationResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofSeconds(1)))
                    .onErrorResume(e -> Mono.empty())
                    .block();
        } catch (Exception e) {
            return null;
        }
    }

    public KycVerificationResponse getVerification(String verificationId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(kycUrl + "/api/kyc/verification/" + verificationId)
                    .retrieve()
                    .bodyToMono(KycVerificationResponse.class)
                    .timeout(Duration.ofSeconds(5))
                    .onErrorResume(e -> Mono.empty())
                    .block();
        } catch (Exception e) {
            return null;
        }
    }
}
