package com.paymentplatform.ledger.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.ledger.dto.LedgerDTO;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.entity.LedgerEntry.EntryType;
import com.paymentplatform.ledger.repository.LedgerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LedgerServiceTest {

    @Mock
    private LedgerRepository ledgerRepository;

    private LedgerService ledgerService;

    @BeforeEach
    void setUp() {
        ledgerService = new LedgerService(ledgerRepository);
    }

    @Test
    void saveEntries_persistsAllEntries() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        when(ledgerRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        List<LedgerDTO> result = ledgerService.saveEntries(List.of(debitEntry, creditEntry));

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(ledgerRepository, times(1)).saveAll(any());
    }

    @Test
    void saveEntries_emptyList_returnsEmptyList() {
        when(ledgerRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        List<LedgerDTO> result = ledgerService.saveEntries(List.of());

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(ledgerRepository, times(1)).saveAll(any());
    }

    @Test
    void saveEntriesAndValidate_balancedEntries_succeeds() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        when(ledgerRepository.saveAll(any())).thenAnswer(inv -> inv.getArgument(0));

        ledgerService.saveEntriesAndValidate(List.of(debitEntry, creditEntry));

        verify(ledgerRepository, times(1)).saveAll(any());
    }

    @Test
    void saveEntriesAndValidate_unbalancedEntries_throwsException() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("50.00"))
                .currency("MGA")
                .build();

        BusinessException exception = assertThrows(BusinessException.class, () ->
                ledgerService.saveEntriesAndValidate(List.of(debitEntry, creditEntry))
        );

        assertTrue(exception.getMessage().contains("déséquilibré"));
        verify(ledgerRepository, never()).saveAll(any());
    }

    @Test
    void saveEntriesAndValidate_emptyEntries_throwsException() {
        BusinessException exception = assertThrows(BusinessException.class, () ->
                ledgerService.saveEntriesAndValidate(List.of())
        );

        assertTrue(exception.getMessage().contains("requises"));
    }

    @Test
    void saveEntriesAndValidate_mixedTransactionIds_throwsException() {
        LedgerEntry entry1 = LedgerEntry.builder()
                .transactionId(UUID.randomUUID())
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry entry2 = LedgerEntry.builder()
                .transactionId(UUID.randomUUID())
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        BusinessException exception = assertThrows(BusinessException.class, () ->
                ledgerService.saveEntriesAndValidate(List.of(entry1, entry2))
        );

        assertTrue(exception.getMessage().contains("même transactionId"));
    }

    @Test
    void validateBalance_balancedTransaction_succeeds() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        when(ledgerRepository.findByTransactionId(transactionId)).thenReturn(List.of(debitEntry, creditEntry));

        assertDoesNotThrow(() -> ledgerService.validateBalance(transactionId));
    }

    @Test
    void validateBalance_unbalancedTransaction_throwsException() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("100.00"))
                .currency("MGA")
                .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.CREDIT)
                .amount(new BigDecimal("50.00"))
                .currency("MGA")
                .build();

        when(ledgerRepository.findByTransactionId(transactionId)).thenReturn(List.of(debitEntry, creditEntry));

        BusinessException exception = assertThrows(BusinessException.class, () ->
                ledgerService.validateBalance(transactionId)
        );

        assertTrue(exception.getMessage().contains("déséquilibré"));
        assertTrue(exception.getMessage().contains(transactionId.toString()));
    }

    @Test
    void validateBalance_emptyEntries_doesNothing() {
        UUID transactionId = UUID.randomUUID();
        when(ledgerRepository.findByTransactionId(transactionId)).thenReturn(List.of());

        assertDoesNotThrow(() -> ledgerService.validateBalance(transactionId));
    }

    @Test
    void getByTransactionId_returnsMatchingEntries() {
        UUID transactionId = UUID.randomUUID();
        LedgerEntry entry = LedgerEntry.builder()
                .id(UUID.randomUUID())
                .transactionId(transactionId)
                .accountId(UUID.randomUUID())
                .entryType(EntryType.DEBIT)
                .amount(new BigDecimal("50.00"))
                .currency("MGA")
                .build();

        when(ledgerRepository.findByTransactionId(transactionId)).thenReturn(List.of(entry));

        List<LedgerDTO> result = ledgerService.getByTransactionId(transactionId);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(transactionId, result.get(0).getTransactionId());
        assertEquals(new BigDecimal("50.00"), result.get(0).getAmount());
        verify(ledgerRepository, times(1)).findByTransactionId(transactionId);
    }
}
