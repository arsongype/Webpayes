package com.paymentplatform.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.auth.dto.RegisterResponseDTO;
import com.paymentplatform.auth.dto.LoginRequestDTO;
import com.paymentplatform.auth.dto.RegisterRequestDTO;
import com.paymentplatform.auth.service.AuthService;
import com.paymentplatform.security.jwt.JwtTokenProvider;
import com.paymentplatform.security.UserDetailsServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private com.paymentplatform.agent.service.AiAgentService aiAgentService;

    @MockBean
    private com.paymentplatform.idempotency.IdempotencyService idempotencyService;

    @Test
    void register_returnsCreated() throws Exception {
        RegisterRequestDTO req = new RegisterRequestDTO(
                "John", "Doe", "john@example.com", "+261340000000", "123456789012",
                "2000-01-01", "Malagasy", "password123", "password123", null
        );
        RegisterResponseDTO.UserSummary userSummary = new RegisterResponseDTO.UserSummary(
                UUID.randomUUID(), "John", "Doe", "john@example.com", "USER", "ACCT-123"
        );
        RegisterResponseDTO resp = new RegisterResponseDTO("Compte créé avec succès. Veuillez vous connecter.", userSummary);

        when(authService.register(any(RegisterRequestDTO.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    void login_returnsOk() throws Exception {
        LoginRequestDTO req = new LoginRequestDTO("john@example.com", "password123", null);
        com.paymentplatform.auth.dto.AuthResponseDTO.UserSummary userSummary = new com.paymentplatform.auth.dto.AuthResponseDTO.UserSummary(
                UUID.randomUUID(), "John", "Doe", "john@example.com", "USER", "ACCT-123", false
        );
        com.paymentplatform.auth.dto.AuthResponseDTO resp = new com.paymentplatform.auth.dto.AuthResponseDTO("token", "Bearer", userSummary, false);

        when(authService.login(any(LoginRequestDTO.class))).thenReturn(resp);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
