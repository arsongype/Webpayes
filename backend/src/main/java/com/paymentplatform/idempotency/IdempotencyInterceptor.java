package com.paymentplatform.idempotency;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;

@Slf4j
@Component
public class IdempotencyInterceptor implements HandlerInterceptor {

    private final IdempotencyService idempotencyService;

    public IdempotencyInterceptor(IdempotencyService idempotencyService) {
        this.idempotencyService = idempotencyService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String idempotencyKey = request.getHeader("Idempotency-Key");
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true;
        }

        if (idempotencyService.isProcessing(idempotencyKey)) {
            try {
                response.sendError(HttpServletResponse.SC_CONFLICT,
                        "{\"error\":\"Requête en cours de traitement pour cette clé d'idempotence\"}");
            } catch (IOException e) {
                log.error("Failed to send 409 conflict for idempotency key: {}", idempotencyKey, e);
            }
            return false;
        }

        boolean marked = idempotencyService.markProcessing(idempotencyKey);
        if (!marked) {
            try {
                response.sendError(HttpServletResponse.SC_CONFLICT,
                        "{\"error\":\"Requête en cours de traitement pour cette clé d'idempotence\"}");
            } catch (IOException e) {
                log.error("Failed to send 409 conflict for idempotency key: {}", idempotencyKey, e);
            }
            return false;
        }

        return true;
    }
}
