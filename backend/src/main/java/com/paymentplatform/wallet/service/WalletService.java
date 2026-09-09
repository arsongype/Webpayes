package com.paymentplatform.wallet.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.wallet.WalletTransactionType;
import com.paymentplatform.wallet.dto.WalletTransactionDTO;
import com.paymentplatform.wallet.entity.WalletTransaction;
import com.paymentplatform.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class WalletService {

    private final AccountRepository accountRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public BigDecimal getBalance(UUID currentUserId, boolean isAdmin, UUID accountId) {
        Account account = resolveAccount(accountId, currentUserId, isAdmin);
        return account.getBalance();
    }

    public List<WalletTransactionDTO> listHistory(UUID currentUserId, boolean isAdmin, UUID accountId) {
        Account account = resolveAccount(accountId, currentUserId, isAdmin);
        return walletTransactionRepository.findByAccountOrderByCreatedAtDesc(account).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WalletTransactionDTO deposit(UUID currentUserId, boolean isAdmin, UUID accountId, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant doit être supérieur à zéro", HttpStatus.BAD_REQUEST);
        }

        Account account = resolveAccount(accountId, currentUserId, isAdmin);
        BigDecimal before = account.getBalance();
        account.setBalance(before.add(amount));
        accountRepository.save(account);
        log.info("WALLET deposit account={} before={} after={} amount={}", accountId, before, account.getBalance(), amount);

        WalletTransaction txn = WalletTransaction.builder()
                .account(account)
                .type(WalletTransactionType.DEPOSIT)
                .amount(amount)
                .currency(account.getCurrency())
                .description(description)
                .build();

        return toDto(walletTransactionRepository.save(txn));
    }

    public WalletTransactionDTO withdraw(UUID currentUserId, boolean isAdmin, UUID accountId, BigDecimal amount, String description) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant doit être supérieur à zéro", HttpStatus.BAD_REQUEST);
        }

        Account account = resolveAccount(accountId, currentUserId, isAdmin);
        BigDecimal before = account.getBalance();
        if (before.compareTo(amount) < 0) {
            throw new BusinessException("Solde insuffisant", HttpStatus.BAD_REQUEST);
        }

        account.setBalance(before.subtract(amount));
        accountRepository.save(account);
        log.info("WALLET withdraw account={} before={} after={} amount={}", accountId, before, account.getBalance(), amount);

        WalletTransaction txn = WalletTransaction.builder()
                .account(account)
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(amount)
                .currency(account.getCurrency())
                .description(description)
                .build();

        return toDto(walletTransactionRepository.save(txn));
    }

    private Account resolveAccount(UUID accountId, UUID currentUserId, boolean isAdmin) {
        if (accountId == null) {
            throw new BusinessException("L'identifiant du compte est requis", HttpStatus.BAD_REQUEST);
        }
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        if (!isAdmin && !account.getUser().getId().equals(currentUserId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        return account;
    }

    private WalletTransactionDTO toDto(WalletTransaction transaction) {
        return new WalletTransactionDTO(
                transaction.getId(),
                transaction.getAccount().getId(),
                transaction.getType().name(),
                transaction.getAmount(),
                transaction.getCurrency(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }
}
