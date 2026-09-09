package com.paymentplatform.transaction;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.controller.TransactionController;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.service.TransactionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.paymentplatform.security.jwt.JwtTokenProvider;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TransactionController.class)
@AutoConfigureMockMvc(addFilters = false)
class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TransactionService transactionService;

    @MockBean
    private CurrentUserService currentUserService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.paymentplatform.security.UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private com.paymentplatform.security.jwt.JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private com.paymentplatform.agent.service.AiAgentService aiAgentService;

    @MockBean
    private com.paymentplatform.idempotency.IdempotencyService idempotencyService;

    @Test
    void transfer_endpoint_returns_ok() throws Exception {
        UUID s = UUID.randomUUID();
        UUID r = UUID.randomUUID();

        TransferRequestDTO req = new TransferRequestDTO(s, r, new BigDecimal("5.00"), "test");

        TransferResponseDTO resp = TransferResponseDTO.builder()
                .id(UUID.randomUUID())
                .senderAccountId(s)
                .receiverAccountId(r)
                .amount(new BigDecimal("5.00"))
                .currency("MGA")
                .status(com.paymentplatform.transaction.TransactionStatus.COMPLETED)
                .reference("TXN-123")
                .build();

        when(transactionService.transfer(any(TransferRequestDTO.class))).thenReturn(resp);

        mockMvc.perform(post("/api/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
