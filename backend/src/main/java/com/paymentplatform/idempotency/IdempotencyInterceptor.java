package com.paymentplatform.idempotency;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

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

        return idempotencyService.getResponse(idempotencyKey)
                .map(cached -> {
                    try {
                        response.setStatus(HttpServletResponse.SC_OK);
                        response.setContentType("application/json");
                        response.getWriter().write(cached);
                    } catch (Exception e) {
                        log.error("Failed to write cached idempotency response", e);
                    }
                    return false;
                })
                .orElse(true);
    }
}
