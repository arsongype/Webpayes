package com.paymentplatform.reconciliation.repository;

import com.paymentplatform.reconciliation.entity.ReconciliationEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReconciliationEntryRepository extends JpaRepository<ReconciliationEntry, UUID> {
    List<ReconciliationEntry> findByReconciliationId(UUID reconciliationId);
    List<ReconciliationEntry> findByTransactionId(UUID transactionId);
}
