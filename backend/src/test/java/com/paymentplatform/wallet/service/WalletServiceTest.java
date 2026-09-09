package com.paymentplatform.wallet.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.wallet.entity.WalletTransaction;
import com.paymentplatform.wallet.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@Transactional
class WalletServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private WalletTransactionRepository walletTransactionRepository;

    private WalletService walletService;

    @BeforeEach
    void setUp() {
        walletService = new WalletService(accountRepository, walletTransactionRepository);
    }

    private Account createAccount(UUID id, UUID userId, BigDecimal balance) {
        User user = User.builder()
                .id(userId)
                .firstName("Test")
                .lastName("User")
                .email("test@example.com")
                .passwordHash("hash")
                .role(com.paymentplatform.common.constants.Role.USER)
                .enabled(true)
                .build();

        Account account = new Account();
        account.setId(id);
        account.setAccountNumber("ACCT-" + id.toString().substring(0, 8).toUpperCase());
        account.setBalance(balance);
        account.setCurrency("MGA");
        account.setUser(user);
        return account;
    }

    @Test
    void deposit_validAmount_increasesBalance() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = createAccount(accountId, userId, new BigDecimal("100.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class))).thenAnswer(inv -> {
            WalletTransaction txn = inv.getArgument(0);
            txn.setId(UUID.randomUUID());
            return txn;
        });

        var result = walletService.deposit(userId, false, accountId, new BigDecimal("50.00"), "Test deposit");

        assertNotNull(result);
        assertEquals(new BigDecimal("150.00"), account.getBalance());
        verify(accountRepository, times(1)).save(account);
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void deposit_zeroAmount_throwsException() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        assertThrows(BusinessException.class, () ->
                walletService.deposit(userId, false, accountId, BigDecimal.ZERO, "Test")
        );
    }

    @Test
    void deposit_negativeAmount_throwsException() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        assertThrows(BusinessException.class, () ->
                walletService.deposit(userId, false, accountId, new BigDecimal("-10.00"), "Test")
        );
    }

    @Test
    void withdraw_validAmount_decreasesBalance() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = createAccount(accountId, userId, new BigDecimal("100.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class))).thenAnswer(inv -> {
            WalletTransaction txn = inv.getArgument(0);
            txn.setId(UUID.randomUUID());
            return txn;
        });

        var result = walletService.withdraw(userId, false, accountId, new BigDecimal("30.00"), "Test withdrawal");

        assertNotNull(result);
        assertEquals(new BigDecimal("70.00"), account.getBalance());
        verify(accountRepository, times(1)).save(account);
        verify(walletTransactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void withdraw_insufficientBalance_throwsException() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = createAccount(accountId, userId, new BigDecimal("20.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        assertThrows(BusinessException.class, () ->
                walletService.withdraw(userId, false, accountId, new BigDecimal("50.00"), "Test")
        );
    }

    @Test
    void withdraw_exactBalance_succeeds() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = createAccount(accountId, userId, new BigDecimal("100.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> inv.getArgument(0));
        when(walletTransactionRepository.save(any(WalletTransaction.class))).thenAnswer(inv -> {
            WalletTransaction txn = inv.getArgument(0);
            txn.setId(UUID.randomUUID());
            return txn;
        });

        var result = walletService.withdraw(userId, false, accountId, new BigDecimal("100.00"), "Test withdrawal");

        assertNotNull(result);
        assertEquals(0, account.getBalance().compareTo(BigDecimal.ZERO));
    }

    @Test
    void getBalance_returnsCurrentBalance() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Account account = createAccount(accountId, userId, new BigDecimal("75.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        BigDecimal balance = walletService.getBalance(userId, false, accountId);

        assertEquals(new BigDecimal("75.00"), balance);
    }

    @Test
    void resolveAccount_adminCanAccessAnyAccount() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        Account account = createAccount(accountId, otherUserId, new BigDecimal("50.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        BigDecimal balance = walletService.getBalance(userId, true, accountId);

        assertNotNull(balance);
        assertEquals(new BigDecimal("50.00"), balance);
    }

    @Test
    void resolveAccount_nonOwnerThrowsForbidden() {
        UUID accountId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();
        Account account = createAccount(accountId, otherUserId, new BigDecimal("50.00"));

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));

        assertThrows(BusinessException.class, () ->
                walletService.getBalance(userId, false, accountId)
        );
    }
}
