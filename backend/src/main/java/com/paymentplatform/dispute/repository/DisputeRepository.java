package com.paymentplatform.dispute.repository;

import com.paymentplatform.dispute.entity.Dispute;
import com.paymentplatform.dispute.entity.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {

    List<Dispute> findByCreatedById(UUID createdById);

    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);

    Optional<Dispute> findByTransactionId(UUID transactionId);

    boolean existsByTransactionIdAndStatusIn(UUID transactionId, List<DisputeStatus> statuses);
}
