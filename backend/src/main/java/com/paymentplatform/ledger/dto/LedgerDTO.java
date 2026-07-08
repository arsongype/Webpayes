package com.paymentplatform.ledger.dto;

import com.paymentplatform.ledger.entity.LedgerEntry;
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
public class LedgerDTO {
    private UUID id;
    private UUID transactionId;
    private UUID accountId;
    private LedgerEntry.EntryType entryType;
    private BigDecimal amount;
    private String currency;
    private Instant createdAt;
}