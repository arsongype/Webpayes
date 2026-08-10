package com.paymentplatform.billing.repository;

import com.paymentplatform.billing.entity.BillingInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BillingInfoRepository extends JpaRepository<BillingInfo, UUID> {

    Optional<BillingInfo> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}
