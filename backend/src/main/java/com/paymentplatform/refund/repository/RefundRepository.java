package com.paymentplatform.refund.repository;

import com.paymentplatform.refund.entity.Refund;
import com.paymentplatform.refund.entity.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefundRepository extends JpaRepository<Refund, UUID> {

    List<Refund> findByRequestedById(UUID requestedById);

    Page<Refund> findByStatus(RefundStatus status, Pageable pageable);

    Optional<Refund> findByTransactionId(UUID transactionId);

    boolean existsByTransactionIdAndStatus(UUID transactionId, RefundStatus status);
}
