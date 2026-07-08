package com.paymentplatform.transaction;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.transaction.service.TransactionService;
import com.paymentplatform.wallet.service.WalletService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TransactionServiceTest {

    private TransactionRepository transactionRepository;
    private AccountRepository accountRepository;
    private LedgerService ledgerService;
    private CurrentUserService currentUserService;
    private WalletService walletService;
    private com.paymentplatform.aiclient.FraudDetectionClient fraudClient;
    private com.paymentplatform.aiclient.RiskScoringClient riskClient;
    private TransactionService transactionService;

    @BeforeEach
    void setUp() {
        transactionRepository = mock(TransactionRepository.class);
        accountRepository = mock(AccountRepository.class);
        ledgerService = mock(LedgerService.class);
        currentUserService = mock(CurrentUserService.class);
        walletService = mock(WalletService.class);
        fraudClient = mock(com.paymentplatform.aiclient.FraudDetectionClient.class);
        riskClient = mock(com.paymentplatform.aiclient.RiskScoringClient.class);

        transactionService = new TransactionService(
                transactionRepository,
                accountRepository,
                ledgerService,
                currentUserService,
                walletService,
                fraudClient,
                riskClient,
                mock(com.paymentplatform.operator.OperatorClientRegistry.class)
        );
    }

    @Test
    void transfer_success_calls_services_and_returns_response() {
        UUID senderId = UUID.randomUUID();
        UUID receiverId = UUID.randomUUID();
        UUID currentUser = UUID.randomUUID();

        Account sender = new Account();
        sender.setId(senderId);
        sender.setAccountNumber("SENDER-123");
        sender.setBalance(new BigDecimal("100.00"));
        sender.setCurrency("MGA");
        sender.setUser(com.paymentplatform.user.entity.User.builder()
            .id(currentUser)
            .firstName("u")
            .lastName("u")
            .email("u@example.com")
            .passwordHash("pass")
            .role(com.paymentplatform.common.constants.Role.USER)
            .enabled(true)
            .build());

        Account receiver = new Account();
        receiver.setId(receiverId);
        receiver.setAccountNumber("RCV-123");
        receiver.setBalance(new BigDecimal("10.00"));
        receiver.setCurrency("MGA");
        receiver.setUser(com.paymentplatform.user.entity.User.builder()
            .id(UUID.randomUUID())
            .firstName("r")
            .lastName("r")
            .email("r@example.com")
            .passwordHash("pass")
            .role(com.paymentplatform.common.constants.Role.USER)
            .enabled(true)
            .build());

        when(currentUserService.getCurrentUserId()).thenReturn(currentUser);
        when(currentUserService.isCurrentUserAdmin()).thenReturn(false);
        when(accountRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(accountRepository.findById(receiverId)).thenReturn(Optional.of(receiver));

        TransferRequestDTO req = new TransferRequestDTO(senderId, receiverId, new BigDecimal("25.00"), "Payment");

        when(transactionRepository.save(any(Transaction.class))).thenAnswer(inv -> {
            Transaction t = inv.getArgument(0);
            t.setId(UUID.randomUUID());
            return t;
        });
        when(fraudClient.analyze(any())).thenReturn(com.paymentplatform.aiclient.FraudDetectionResponse.builder().fraudScore(0.0).build());
        when(riskClient.score(any())).thenReturn(com.paymentplatform.aiclient.RiskScoringResponse.builder().riskScore(0.0).build());

        TransferResponseDTO resp = transactionService.transfer(req);

        assertNotNull(resp);
        assertEquals(new BigDecimal("25.00"), resp.getAmount());
        verify(ledgerService, times(1)).saveEntries(any());
        verify(walletService, times(1)).withdraw(any(), anyBoolean(), any(), any(), any());
        verify(walletService, times(1)).deposit(any(), anyBoolean(), any(), any(), any());
    }
}
