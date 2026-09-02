package com.paymentplatform.reconciliation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reconciliation_entries", indexes = {
    @Index(name = "idx_recon_entry_recon", columnList = "reconciliation_id"),
    @Index(name = "idx_recon_entry_status", columnList = "match_status"),
    @Index(name = "idx_recon_entry_tx", columnList = "transaction_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReconciliationEntry {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "reconciliation_id", nullable = false)
    private UUID reconciliationId;

    @Column(name = "end_to_end_id", length = 64)
    private String endToEndId;

    @Column(name = "transaction_id")
    private UUID transactionId;

    @Column(name = "amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency;

    @Column(name = "value_date")
    private Instant valueDate;

    @Column(name = "counterparty_iban", length = 64)
    private String counterpartyIban;

    @Column(name = "counterparty_name", length = 255)
    private String counterpartyName;

    @Column(name = "reference", length = 255)
    private String reference;

    @Enumerated(EnumType.STRING)
    @Column(name = "match_status", nullable = false, length = 20)
    private MatchStatus matchStatus;

    @Column(name = "discrepancy_reason", length = 255)
    private String discrepancyReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (matchStatus == null) matchStatus = MatchStatus.PENDING;
    }

    public enum MatchStatus {
        MATCHED,
        UNMATCHED,
        AMOUNT_MISMATCH,
        DUPLICATE,
        PENDING
    }
}
