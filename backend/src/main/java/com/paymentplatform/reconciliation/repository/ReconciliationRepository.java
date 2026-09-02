package com.paymentplatform.reconciliation.repository;

import com.paymentplatform.reconciliation.entity.Reconciliation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReconciliationRepository extends JpaRepository<Reconciliation, UUID> {
    Optional<Reconciliation> findByFileHash(String fileHash);
    Page<Reconciliation> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Reconciliation> findByStatusOrderByCreatedAtDesc(Reconciliation.ReconciliationStatus status, Pageable pageable);
}
