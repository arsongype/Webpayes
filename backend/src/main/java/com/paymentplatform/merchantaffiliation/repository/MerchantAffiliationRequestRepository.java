package com.paymentplatform.merchantaffiliation.repository;

import com.paymentplatform.merchantaffiliation.entity.AffiliationRequestStatus;
import com.paymentplatform.merchantaffiliation.entity.MerchantAffiliationRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MerchantAffiliationRequestRepository extends JpaRepository<MerchantAffiliationRequest, UUID> {

    Optional<MerchantAffiliationRequest> findByUserId(UUID userId);

    Optional<MerchantAffiliationRequest> findByUserIdAndStatus(UUID userId, AffiliationRequestStatus status);

    Page<MerchantAffiliationRequest> findByStatus(AffiliationRequestStatus status, Pageable pageable);

    boolean existsByUserIdAndStatus(UUID userId, AffiliationRequestStatus status);
}
