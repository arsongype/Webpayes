package com.paymentplatform.reconciliation.dto;

import com.paymentplatform.reconciliation.entity.Reconciliation;
import com.paymentplatform.reconciliation.entity.ReconciliationEntry;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReconciliationResponse {
    private UUID id;
    private String fileName;
    private String fileHash;
    private Instant statementDate;
    private String iban;
    private BigDecimal openingBalance;
    private BigDecimal closingBalance;
    private BigDecimal statementAmount;
    private BigDecimal bookAmount;
    private BigDecimal discrepancy;
    private int matchedCount;
    private int unmatchedCount;
    private int totalEntries;
    private String status;
    private String notes;
    private String performedBy;
    private Instant createdAt;

    public static ReconciliationResponse from(Reconciliation r) {
        return ReconciliationResponse.builder()
            .id(r.getId())
            .fileName(r.getFileName())
            .fileHash(r.getFileHash())
            .statementDate(r.getStatementDate())
            .iban(r.getIban())
            .openingBalance(r.getOpeningBalance())
            .closingBalance(r.getClosingBalance())
            .statementAmount(r.getStatementAmount())
            .bookAmount(r.getBookAmount())
            .discrepancy(r.getDiscrepancy())
            .matchedCount(r.getMatchedCount())
            .unmatchedCount(r.getUnmatchedCount())
            .totalEntries(r.getTotalEntries())
            .status(r.getStatus().name())
            .notes(r.getNotes())
            .performedBy(r.getPerformedBy())
            .createdAt(r.getCreatedAt())
            .build();
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EntryView {
        private UUID id;
        private String endToEndId;
        private UUID transactionId;
        private BigDecimal amount;
        private String currency;
        private Instant valueDate;
        private String counterpartyIban;
        private String counterpartyName;
        private String reference;
        private String matchStatus;
        private String discrepancyReason;

        public static EntryView from(ReconciliationEntry e) {
            return EntryView.builder()
                .id(e.getId())
                .endToEndId(e.getEndToEndId())
                .transactionId(e.getTransactionId())
                .amount(e.getAmount())
                .currency(e.getCurrency())
                .valueDate(e.getValueDate())
                .counterpartyIban(e.getCounterpartyIban())
                .counterpartyName(e.getCounterpartyName())
                .reference(e.getReference())
                .matchStatus(e.getMatchStatus().name())
                .discrepancyReason(e.getDiscrepancyReason())
                .build();
        }
    }
}
