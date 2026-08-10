package com.paymentplatform.merchantprofile.repository;

import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.entity.MerchantProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MerchantProfileRepository extends JpaRepository<MerchantProfile, UUID> {

    Optional<MerchantProfile> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Page<MerchantProfile> findByStatus(MerchantProfileStatus status, Pageable pageable);
}
