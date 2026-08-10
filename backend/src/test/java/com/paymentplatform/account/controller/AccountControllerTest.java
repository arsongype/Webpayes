package com.paymentplatform.account.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.account.dto.AccountDTO;
import com.paymentplatform.account.dto.AccountRequestDTO;
import com.paymentplatform.account.service.AccountService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AccountController.class)
@AutoConfigureMockMvc(addFilters = false)
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AccountService accountService;

    @MockBean
    private CurrentUserService currentUserService;

    @MockBean
    private com.paymentplatform.security.jwt.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.paymentplatform.security.UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private com.paymentplatform.security.jwt.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void listAccounts_returnsOk() throws Exception {
        when(currentUserService.getCurrentUserId()).thenReturn(UUID.randomUUID());
        when(currentUserService.isCurrentUserAdmin()).thenReturn(false);
        when(accountService.listAccounts(any(), anyBoolean(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk());
    }

    @Test
    void createAccount_returnsOk() throws Exception {
        UUID userId = UUID.randomUUID();
        when(currentUserService.getCurrentUserId()).thenReturn(userId);
        when(currentUserService.isCurrentUserAdmin()).thenReturn(false);

        AccountDTO dto = AccountDTO.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .accountNumber("ACCT-123")
                .balance(BigDecimal.ZERO)
                .currency("MGA")
                .build();

        when(accountService.createAccount(any(AccountRequestDTO.class), any(), anyBoolean())).thenReturn(dto);

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AccountRequestDTO(null, null, BigDecimal.ZERO, "MGA"))))
                .andExpect(status().isOk());
    }
}
