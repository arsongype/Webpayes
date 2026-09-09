package com.paymentplatform.config;

import com.paymentplatform.agent.service.AiAgentService;
import com.paymentplatform.agent.security.AgentAuthFilter;
import com.paymentplatform.auth.controller.AuthController;
import com.paymentplatform.auth.service.AuthService;
import com.paymentplatform.idempotency.IdempotencyService;
import com.paymentplatform.security.UserDetailsServiceImpl;
import com.paymentplatform.security.jwt.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class SecurityHeadersTest {

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private AgentAuthFilter agentAuthFilter;

    @MockBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private AiAgentService aiAgentService;

    @MockBean
    private IdempotencyService idempotencyService;

    @Autowired
    private MockMvc mockMvc;

    @Test
    void publicEndpoint_hasSecurityHeaders() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.post("/api/auth/register"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"));
    }
}
