package com.paymentplatform.user.dto;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {
    private UserDTO user;
    private AccountSummary account;
    private KycSummary kyc;
    private SecuritySummary security;
    private StatsSummary stats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccountSummary {
        private UUID id;
        private String accountNumber;
        private BigDecimal balance;
        private String currency;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KycSummary {
        private String status;
        private Double confidence;
        private Instant verifiedAt;
        private int attempts;
        private int maxAttempts;
        private int remainingAttempts;
        private boolean locked;
        private Instant lockedUntil;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecuritySummary {
        private boolean twoFactorEnabled;
        private boolean emailVerified;
        private int recoveryCodesRemaining;
        private Instant lastLoginAt;
        private String lastLoginIp;
        private int failedLoginCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsSummary {
        private long transactionsCount;
        private long apiKeysCount;
        private Instant memberSince;
    }

    public static AccountSummary from(Account a) {
        if (a == null) return null;
        return AccountSummary.builder()
            .id(a.getId())
            .accountNumber(a.getAccountNumber())
            .balance(a.getBalance())
            .currency(a.getCurrency())
            .status("ACTIVE")
            .build();
    }
}
