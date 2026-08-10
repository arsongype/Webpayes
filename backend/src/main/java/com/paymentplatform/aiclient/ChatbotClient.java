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
public class ChatbotClient {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.chatbot.url:http://localhost:8004}")
    private String chatbotUrl;

    public ChatResponse chat(@NonNull ChatRequest request) {
        try {
            return webClientBuilder.build()
                    .method(HttpMethod.POST)
                    .uri(chatbotUrl + "/api/chatbot/chat")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .timeout(Duration.ofSeconds(30))
                    .retryWhen(Retry.fixedDelay(1, Duration.ofSeconds(1)))
                    .onErrorResume(e -> Mono.just(ChatResponse.builder()
                            .session_id(request.getSession_id())
                            .reply("Service indisponible pour le moment.")
                            .build()))
                    .block();
        } catch (Exception e) {
            return ChatResponse.builder()
                    .session_id(request.getSession_id())
                    .reply("Erreur de connexion au service chatbot.")
                    .build();
        }
    }
}
