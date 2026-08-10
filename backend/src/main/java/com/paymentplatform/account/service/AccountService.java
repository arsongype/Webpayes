package com.paymentplatform.account.service;

import com.paymentplatform.account.dto.AccountDTO;
import com.paymentplatform.account.dto.AccountRequestDTO;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.entity.AccountKycStatus;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final com.paymentplatform.aiclient.KycClient kycClient;

    public List<AccountDTO> listAccounts(UUID currentUserId, boolean isAdmin, UUID filterUserId) {
        if (filterUserId != null) {
            if (!isAdmin) {
                throw new AccessDeniedException("Accès refusé");
            }
            return accountRepository.findByUserId(filterUserId)
                    .map(account -> List.of(toDto(account)))
                    .orElse(List.of());
        }

        if (isAdmin) {
            return accountRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        }

        return accountRepository.findByUserId(currentUserId)
                .map(account -> List.of(toDto(account)))
                .orElse(List.of());
    }

    public AccountDTO getAccount(UUID id, UUID currentUserId, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        if (!isAdmin && !Objects.requireNonNull(account.getUser()).getId().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        return toDto(account);
    }

    public AccountDTO createAccount(AccountRequestDTO body, UUID currentUserId, boolean isAdmin) {
        UUID targetUserId = body.userId();
        if (targetUserId != null && !isAdmin) {
            throw new AccessDeniedException("Accès refusé");
        }

        User user = resolveUser(targetUserId != null ? targetUserId : currentUserId);
        accountRepository.findByUserId(user.getId()).ifPresent(existing -> {
            throw new BusinessException("Un compte existe déjà pour cet utilisateur", HttpStatus.CONFLICT);
        });

        String accountNumber = body.accountNumber();
        if (accountNumber == null || accountNumber.isBlank()) {
            accountNumber = generateAccountNumber();
        }

        BigDecimal balance = body.balance() != null ? body.balance() : BigDecimal.ZERO;
        String currency = body.currency() != null ? body.currency() : "MGA";

        Account account = Account.builder()
                .user(user)
                .accountNumber(accountNumber)
                .balance(balance)
                .currency(currency)
                .build();

        // Verify the account holder identity through the KYC AI service.
        // Failures are non-blocking: the account is still created, simply unverified.
        AccountKycStatus kycStatus = AccountKycStatus.NOT_VERIFIED;
        try {
            com.paymentplatform.aiclient.KycAccountVerificationResponse kycResponse = kycClient.verifyAccount(
                    com.paymentplatform.aiclient.KycAccountVerificationRequest.builder()
                            .user_id(user.getId().toString())
                            .account_number(accountNumber)
                            .full_name(((user.getFirstName() != null ? user.getFirstName() : "") + " "
                                    + (user.getLastName() != null ? user.getLastName() : "")).trim())
                            .build());
            if (kycResponse != null && Boolean.TRUE.equals(kycResponse.getVerified())) {
                kycStatus = AccountKycStatus.VERIFIED;
            }
        } catch (Exception ignored) {
            // keep NOT_VERIFIED when the KYC service is unavailable
        }
        account.setKycStatus(kycStatus);

        return toDto(accountRepository.save(account));
    }

    public AccountDTO updateAccount(UUID id, AccountRequestDTO body, UUID currentUserId, boolean isAdmin) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        if (!isAdmin && !Objects.requireNonNull(account.getUser()).getId().equals(currentUserId)) {
            throw new AccessDeniedException("Accès refusé");
        }

        if (body.accountNumber() != null && !body.accountNumber().isBlank()) {
            account.setAccountNumber(body.accountNumber());
        }
        if (body.balance() != null) {
            account.setBalance(body.balance());
        }
        if (body.currency() != null && !body.currency().isBlank()) {
            account.setCurrency(body.currency());
        }

        return toDto(accountRepository.save(account));
    }

    public void deleteAccount(UUID id, UUID currentUserId, boolean isAdmin) {
        if (!isAdmin) {
            throw new AccessDeniedException("Accès refusé");
        }

        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        accountRepository.delete(account);
    }

    private User resolveUser(UUID userId) {
        return Objects.requireNonNull(
                userRepository.findById(userId)
                        .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.BAD_REQUEST))
        );
    }

    private String generateAccountNumber() {
        return "ACCT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
    }

    private AccountDTO toDto(Account account) {
        return new AccountDTO(
                account.getId(),
                account.getUser().getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getCurrency(),
                account.getKycStatus() != null ? account.getKycStatus().name() : null,
                account.getCreatedAt()
        );
    }
}
