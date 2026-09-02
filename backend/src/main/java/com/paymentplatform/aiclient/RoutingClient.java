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

@Component
@RequiredArgsConstructor
public class RoutingClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.routing.url:http://127.0.0.1:8001}")
    private String routingUrl;

    public RoutingResponse getBestChannel(@NonNull RoutingRequest request) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(routingUrl + "/api/routing/best-channel")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(RoutingResponse.class)
                     .timeout(Duration.ofSeconds(15))
                    .onErrorResume(e -> Mono.empty())
                    .block();
        } catch (Exception e) {
            return null;
        }
    }
}

