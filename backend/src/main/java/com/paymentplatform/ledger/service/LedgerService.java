package com.paymentplatform.ledger.service;

import com.paymentplatform.ledger.dto.LedgerDTO;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.entity.LedgerEntry.EntryType;
import com.paymentplatform.ledger.repository.LedgerRepository;
import com.paymentplatform.common.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final LedgerRepository ledgerRepository;

    @Transactional
    public List<LedgerDTO> saveEntries(List<LedgerEntry> entries) {
        return new java.util.ArrayList<>(ledgerRepository.saveAll(entries)).stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void saveEntriesAndValidate(List<LedgerEntry> entries) {
        if (entries == null || entries.isEmpty()) {
            throw new BusinessException("Les entrées du ledger sont requises", HttpStatus.BAD_REQUEST);
        }

        UUID transactionId = entries.get(0).getTransactionId();
        boolean allSameTransaction = entries.stream()
                .allMatch(e -> transactionId.equals(e.getTransactionId()));
        if (!allSameTransaction) {
            throw new BusinessException("Toutes les entrées doivent avoir le même transactionId", HttpStatus.BAD_REQUEST);
        }

        BigDecimal totalDebit = entries.stream()
                .filter(e -> EntryType.DEBIT.equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredit = entries.stream()
                .filter(e -> EntryType.CREDIT.equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new BusinessException(
                    String.format("Ledger déséquilibré: DEBIT=%s, CREDIT=%s", totalDebit, totalCredit),
                    HttpStatus.BAD_REQUEST
            );
        }

        saveEntries(entries);
    }

    @Transactional(readOnly = true)
    public void validateBalance(UUID transactionId) {
        List<LedgerEntry> entries = ledgerRepository.findByTransactionId(transactionId);
        if (entries.isEmpty()) {
            return;
        }

        BigDecimal totalDebit = entries.stream()
                .filter(e -> EntryType.DEBIT.equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCredit = entries.stream()
                .filter(e -> EntryType.CREDIT.equals(e.getEntryType()))
                .map(LedgerEntry::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalDebit.compareTo(totalCredit) != 0) {
            throw new BusinessException(
                    String.format("Ledger déséquilibré pour transaction %s: DEBIT=%s, CREDIT=%s",
                            transactionId, totalDebit, totalCredit),
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    public List<LedgerDTO> getByTransactionId(UUID transactionId) {
        return ledgerRepository.findByTransactionId(transactionId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private LedgerDTO toDto(LedgerEntry entry) {
        return LedgerDTO.builder()
                .id(entry.getId())
                .transactionId(entry.getTransactionId())
                .accountId(entry.getAccountId())
                .entryType(entry.getEntryType())
                .amount(entry.getAmount())
                .currency(entry.getCurrency())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}