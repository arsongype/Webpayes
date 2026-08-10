package com.paymentplatform.account.service;

import com.paymentplatform.account.dto.AccountRequestDTO;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.paymentplatform.aiclient.KycClient kycClient;

    @InjectMocks
    private AccountService accountService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .passwordHash("hash")
                .build();
    }

    @Test
    void createAccount_shouldCreateWhenNoExisting() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(accountRepository.findByUserId(user.getId())).thenReturn(Optional.empty());

        AccountRequestDTO req = new AccountRequestDTO(null, null, null, null);

        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> {
            Account a = invocation.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        var dto = accountService.createAccount(req, user.getId(), false);

        assertThat(dto).isNotNull();
        assertThat(dto.getUserId()).isEqualTo(user.getId());
        assertThat(dto.getAccountNumber()).isNotBlank();
        assertThat(dto.getBalance()).isNotNull();
    }

    @Test
    void createAccount_shouldThrowWhenAccountExists() {
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        Account existing = Account.builder().id(UUID.randomUUID()).user(user).accountNumber("EXIST").build();
        when(accountRepository.findByUserId(user.getId())).thenReturn(Optional.of(existing));

        AccountRequestDTO req = new AccountRequestDTO(null, null, null, null);

        assertThatThrownBy(() -> accountService.createAccount(req, user.getId(), false))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void getAccount_shouldThrowWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(accountRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccount(id, user.getId(), false))
                .isInstanceOf(BusinessException.class);
    }
}
