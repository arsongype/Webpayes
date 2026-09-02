package com.paymentplatform.payout.repository;

import com.paymentplatform.payout.entity.Payout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, UUID> {

    Page<Payout> findByMerchantIdOrderByCreatedAtDesc(UUID merchantId, Pageable pageable);

    Page<Payout> findByStatusOrderByCreatedAtDesc(Payout.PayoutStatus status, Pageable pageable);

    List<Payout> findTop100ByStatusOrderByScheduledAtAsc(Payout.PayoutStatus status);

    long countByMerchantIdAndStatus(UUID merchantId, Payout.PayoutStatus status);
}
