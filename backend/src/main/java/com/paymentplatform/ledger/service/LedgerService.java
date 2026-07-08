package com.paymentplatform.ledger.service;

import com.paymentplatform.ledger.dto.LedgerDTO;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.repository.LedgerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LedgerService {

    private final LedgerRepository ledgerRepository;

    @Transactional
    public List<LedgerDTO> saveEntries(List<LedgerEntry> entries) {
        return ledgerRepository.saveAll(entries).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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