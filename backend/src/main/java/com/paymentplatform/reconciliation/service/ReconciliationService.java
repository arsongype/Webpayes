package com.paymentplatform.reconciliation.service;

import com.paymentplatform.reconciliation.entity.Reconciliation;
import com.paymentplatform.reconciliation.entity.ReconciliationEntry;
import com.paymentplatform.reconciliation.parser.Camt053Parser;
import com.paymentplatform.reconciliation.repository.ReconciliationEntryRepository;
import com.paymentplatform.reconciliation.repository.ReconciliationRepository;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.wallet.entity.WalletTransaction;
import com.paymentplatform.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReconciliationService {

    private final ReconciliationRepository reconciliationRepository;
    private final ReconciliationEntryRepository entryRepository;
    private final Camt053Parser parser;
    private final TransactionRepository transactionRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    private static final BigDecimal TOLERANCE = new BigDecimal("0.01");

    @Transactional
    public ReconciliationResult importStatement(String fileName, String xmlContent, String performedBy) {
        String fileHash = sha256(xmlContent);

        Optional<Reconciliation> existing = reconciliationRepository.findByFileHash(fileHash);
        if (existing.isPresent()) {
            return new ReconciliationResult(existing.get(), null, "Statement already imported (duplicate file)");
        }

        Optional<Camt053Parser.ParsedStatement> parsed = parser.parse(xmlContent);
        if (parsed.isEmpty()) {
            throw new IllegalArgumentException("Invalid camt.053 XML file");
        }

        Camt053Parser.ParsedStatement stmt = parsed.get();

        BigDecimal bookAmount = computeBookAmount(stmt.statementDate());

        Reconciliation recon = Reconciliation.builder()
            .fileName(fileName)
            .fileHash(fileHash)
            .statementDate(stmt.statementDate())
            .iban(stmt.iban())
            .openingBalance(stmt.openingBalance())
            .closingBalance(stmt.closingBalance())
            .statementAmount(stmt.closingBalance().subtract(stmt.openingBalance()))
            .bookAmount(bookAmount)
            .discrepancy(stmt.closingBalance().subtract(stmt.openingBalance()).subtract(bookAmount))
            .totalEntries(stmt.entries().size())
            .matchedCount(0)
            .unmatchedCount(0)
            .status(Reconciliation.ReconciliationStatus.PENDING)
            .performedBy(performedBy)
            .build();

        recon = reconciliationRepository.save(recon);

        int matched = 0;
        int unmatched = 0;
        BigDecimal matchedAmount = BigDecimal.ZERO;

        for (ReconciliationEntry entry : stmt.entries()) {
            entry.setReconciliationId(recon.getId());
            Optional<Transaction> matchedTx = matchTransaction(entry);
            if (matchedTx.isPresent()) {
                entry.setTransactionId(matchedTx.get().getId());
                entry.setMatchStatus(ReconciliationEntry.MatchStatus.MATCHED);
                matched++;
                matchedAmount = matchedAmount.add(entry.getAmount());
            } else {
                entry.setMatchStatus(ReconciliationEntry.MatchStatus.UNMATCHED);
                entry.setDiscrepancyReason("No matching transaction found");
                unmatched++;
            }
            entryRepository.save(entry);
        }

        recon.setMatchedCount(matched);
        recon.setUnmatchedCount(unmatched);
        recon.setBookAmount(matchedAmount);

        BigDecimal stmtAmount = recon.getStatementAmount();
        recon.setDiscrepancy(stmtAmount.subtract(matchedAmount));

        if (unmatched == 0 && recon.getDiscrepancy().abs().compareTo(TOLERANCE) <= 0) {
            recon.setStatus(Reconciliation.ReconciliationStatus.COMPLETED);
        } else if (matched > 0) {
            recon.setStatus(Reconciliation.ReconciliationStatus.PARTIAL);
        } else {
            recon.setStatus(Reconciliation.ReconciliationStatus.DISCREPANCY_DETECTED);
        }

        recon = reconciliationRepository.save(recon);
        log.info("Reconciliation {} completed: {} matched, {} unmatched, discrepancy={}",
            recon.getId(), matched, unmatched, recon.getDiscrepancy());

        return new ReconciliationResult(recon, stmt.entries(), null);
    }

    public Page<Reconciliation> listAll(Pageable pageable) {
        return reconciliationRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<Reconciliation> listByStatus(Reconciliation.ReconciliationStatus status, Pageable pageable) {
        return reconciliationRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
    }

    public Optional<Reconciliation> getById(UUID id) {
        return reconciliationRepository.findById(id);
    }

    public List<ReconciliationEntry> getEntries(UUID reconciliationId) {
        return entryRepository.findByReconciliationId(reconciliationId);
    }

    private BigDecimal computeBookAmount(Instant statementDate) {
        Instant from = statementDate.minus(1, ChronoUnit.DAYS);
        Instant to = statementDate.plus(1, ChronoUnit.DAYS);
        List<WalletTransaction> txns = walletTransactionRepository.findByCreatedAtBetween(from, to);
        return txns.stream()
            .map(WalletTransaction::getAmount)
            .filter(java.util.Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Optional<Transaction> matchTransaction(ReconciliationEntry entry) {
        if (entry.getEndToEndId() != null && !entry.getEndToEndId().isBlank()) {
            Optional<Transaction> byRef = transactionRepository.findByReference(entry.getEndToEndId());
            if (byRef.isPresent()) {
                Transaction tx = byRef.get();
                if (tx.getAmount() != null
                    && tx.getAmount().abs().compareTo(entry.getAmount().abs()) == 0) {
                    return byRef;
                }
            }
        }

        if (entry.getReference() != null && !entry.getReference().isBlank()) {
            List<Transaction> candidates = transactionRepository.findByReferenceContainingIgnoreCase(entry.getReference());
            for (Transaction tx : candidates) {
                if (tx.getAmount() != null
                    && tx.getAmount().abs().compareTo(entry.getAmount().abs()) == 0
                    && tx.getCreatedAt() != null
                    && entry.getValueDate() != null
                    && Math.abs(tx.getCreatedAt().getEpochSecond() - entry.getValueDate().getEpochSecond()) < 86400) {
                    return Optional.of(tx);
                }
            }
        }
        return Optional.empty();
    }

    private String sha256(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(content.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    public record ReconciliationResult(
        Reconciliation reconciliation,
        List<ReconciliationEntry> entries,
        String warning
    ) {}
}
