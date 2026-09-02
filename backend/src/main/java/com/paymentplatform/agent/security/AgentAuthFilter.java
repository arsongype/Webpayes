package com.paymentplatform.agent.security;

import com.paymentplatform.agent.entity.AiAgent;
import com.paymentplatform.agent.exception.InvalidApiKeyException;
import com.paymentplatform.agent.service.AiAgentService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Order(100)
@Slf4j
public class AgentAuthFilter extends OncePerRequestFilter {

    private final AiAgentService aiAgentService;

    private static final String API_KEY_HEADER = "X-Agent-API-Key";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        return !path.startsWith("/api/agents/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String apiKey = request.getHeader(API_KEY_HEADER);

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                AiAgent agent = aiAgentService.authenticate(apiKey);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        agent,
                        apiKey,
                        List.of(new SimpleGrantedAuthority("ROLE_AGENT"))
                );

                SecurityContextHolder.getContext().setAuthentication(auth);
                request.setAttribute("agent", agent);
            } catch (InvalidApiKeyException e) {
                log.warn("Invalid agent API key attempt: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("{\"error\":\"Clé API invalide\"}");
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Clé API requise (X-Agent-API-Key)\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
