package com.paymentplatform.merchant.dashboard;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/merchant/dashboard")
@RequiredArgsConstructor
public class MerchantDashboardController {

    private final CurrentUserService currentUserService;
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(
            @RequestParam(defaultValue = "7") int days) {
        UUID userId = currentUserService.getCurrentUserId();
        Account account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) {
            return ResponseEntity.noContent().build();
        }

        Instant now = Instant.now();
        Instant from = now.minus(days, ChronoUnit.DAYS);

        List<Transaction> transactions = transactionRepository
                .findBySenderAccountOrReceiverAccountAndCreatedAtBetween(
                        account, account, from, now,
                        PageRequest.of(0, 1000, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent();

        List<Transaction> completedTransactions = transactions.stream()
                .filter(tx -> tx.getStatus() == TransactionStatus.COMPLETED)
                .toList();

        BigDecimal totalVolume = completedTransactions.stream()
                .filter(tx -> tx.getAmount() != null)
                .map(tx -> tx.getAmount())
                .reduce(BigDecimal.ZERO, (left, right) -> left.add(right));

        long completedCount = transactions.stream()
                .filter(tx -> tx.getStatus() == TransactionStatus.COMPLETED)
                .count();
        long pendingCount = transactions.stream()
                .filter(tx -> tx.getStatus() == TransactionStatus.PENDING)
                .count();
        long failedCount = transactions.stream()
                .filter(tx -> tx.getStatus() == TransactionStatus.FAILED)
                .count();

        Map<String, BigDecimal> dailyVolume = completedTransactions.stream()
                .filter(tx -> tx.getAmount() != null && tx.getCreatedAt() != null)
                .collect(Collectors.groupingBy(
                        tx -> tx.getCreatedAt().truncatedTo(ChronoUnit.DAYS).toString(),
                        Collectors.reducing(BigDecimal.ZERO, tx -> tx.getAmount(), (left, right) -> left.add(right))
                ));

        List<DailyVolume> dailyVolumes = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            Instant day = now.minus(i, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            BigDecimal vol = dailyVolume.getOrDefault(day.toString(), BigDecimal.ZERO);
            dailyVolumes.add(new DailyVolume(day.toString(), vol));
        }

        BigDecimal balance = account.getBalance().subtract(completedTransactions.stream()
                .filter(tx -> tx.getCreatedAt() != null)
                .map(tx -> tx.getReceiverAccount() != null && tx.getReceiverAccount().getId().equals(account.getId())
                        ? tx.getAmount() : tx.getAmount().negate())
                .reduce(BigDecimal.ZERO, (left, right) -> left.add(right)));
        List<BalancePoint> balanceEvolution = new ArrayList<>();
        for (int i = days - 1; i >= 0; i--) {
            Instant day = now.minus(i, ChronoUnit.DAYS).truncatedTo(ChronoUnit.DAYS);
            BigDecimal dayChange = completedTransactions.stream()
                    .filter(tx -> tx.getCreatedAt() != null && tx.getCreatedAt().truncatedTo(ChronoUnit.DAYS).equals(day))
                    .map(tx -> tx.getReceiverAccount() != null && tx.getReceiverAccount().getId().equals(account.getId())
                            ? tx.getAmount() : tx.getAmount().negate())
                    .reduce(BigDecimal.ZERO, (left, right) -> left.add(right));
            balance = balance.add(dayChange);
            balanceEvolution.add(new BalancePoint(day.toString(), balance));
        }

        Map<String, Long> methodCounts = transactions.stream()
                .filter(tx -> tx.getAmount() != null)
                .collect(Collectors.groupingBy(
                        tx -> tx.getMetadata() != null && tx.getMetadata().contains("CARD") ? "card"
                                : tx.getMetadata() != null && tx.getMetadata().contains("MOBILE") ? "mobile_money"
                                : tx.getMetadata() != null ? "internal" : "unknown",
                        Collectors.counting()
                ));

        List<MethodBreakdown> methods = methodCounts.entrySet().stream()
                .map(e -> new MethodBreakdown(e.getKey(), e.getValue().intValue()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(AnalyticsResponse.builder()
                .totalVolume(totalVolume)
                .currentBalance(account.getBalance())
                .totalTransactions(transactions.size())
                .completedTransactions(completedCount)
                .pendingTransactions(pendingCount)
                .failedTransactions(failedCount)
                .successRate(transactions.isEmpty() ? 0 : (double) completedCount / transactions.size() * 100)
                .dailyVolumes(dailyVolumes)
                .balanceEvolution(balanceEvolution)
                .methodBreakdown(methods)
                .build());
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<List<TransactionSummary>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit) {
        UUID userId = currentUserService.getCurrentUserId();
        Account account = accountRepository.findByUserId(userId).orElse(null);
        if (account == null) {
            return ResponseEntity.ok(List.of());
        }

        List<Transaction> transactions = transactionRepository
                .findBySenderAccountOrReceiverAccount(account, account, PageRequest.of(0, limit, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
                .getContent();

        List<TransactionSummary> summaries = transactions.stream()
                .map(tx -> TransactionSummary.builder()
                        .id(tx.getId())
                        .reference(tx.getReference())
                        .amount(tx.getAmount())
                        .currency(tx.getCurrency())
                        .status(tx.getStatus().name())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(summaries);
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AnalyticsResponse {
        private BigDecimal totalVolume;
        private BigDecimal currentBalance;
        private int totalTransactions;
        private long completedTransactions;
        private long pendingTransactions;
        private long failedTransactions;
        private double successRate;
        private List<DailyVolume> dailyVolumes;
        private List<BalancePoint> balanceEvolution;
        private List<MethodBreakdown> methodBreakdown;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyVolume {
        private String date;
        private BigDecimal volume;
    }

        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class BalancePoint {
                private String date;
                private BigDecimal balance;
        }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MethodBreakdown {
        private String method;
        private int count;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionSummary {
        private UUID id;
        private String reference;
        private BigDecimal amount;
        private String currency;
        private String status;
        private Instant createdAt;
    }
}
