package com.paymentplatform.ledger.repository;

import com.paymentplatform.ledger.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LedgerRepository extends JpaRepository<LedgerEntry, UUID> {
    List<LedgerEntry> findByTransactionId(UUID transactionId);
}