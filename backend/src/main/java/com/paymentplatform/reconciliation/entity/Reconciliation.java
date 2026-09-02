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
@Table(name = "reconciliations", indexes = {
    @Index(name = "idx_recon_status", columnList = "status"),
    @Index(name = "idx_recon_file_hash", columnList = "file_hash"),
    @Index(name = "idx_recon_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reconciliation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_hash", nullable = false, length = 64, unique = true)
    private String fileHash;

    @Column(name = "statement_date", nullable = false)
    private Instant statementDate;

    @Column(name = "iban", length = 64)
    private String iban;

    @Column(name = "opening_balance", precision = 19, scale = 4)
    private BigDecimal openingBalance;

    @Column(name = "closing_balance", precision = 19, scale = 4)
    private BigDecimal closingBalance;

    @Column(name = "statement_amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal statementAmount;

    @Column(name = "book_amount", precision = 19, scale = 4, nullable = false)
    private BigDecimal bookAmount;

    @Column(name = "discrepancy", precision = 19, scale = 4, nullable = false)
    private BigDecimal discrepancy;

    @Column(name = "matched_count", nullable = false)
    private int matchedCount;

    @Column(name = "unmatched_count", nullable = false)
    private int unmatchedCount;

    @Column(name = "total_entries", nullable = false)
    private int totalEntries;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReconciliationStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (status == null) status = ReconciliationStatus.PENDING;
    }

    public enum ReconciliationStatus {
        PENDING,
        COMPLETED,
        PARTIAL,
        FAILED,
        DISCREPANCY_DETECTED
    }
}
