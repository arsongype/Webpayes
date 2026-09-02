package com.paymentplatform.merchant.repository;

import com.paymentplatform.merchant.entity.MerchantApiKey;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantApiKeyRepository extends JpaRepository<MerchantApiKey, UUID> {
    Optional<MerchantApiKey> findByApiKeyHash(String apiKeyHash);

    List<MerchantApiKey> findByMerchantProfileAndActiveTrue(MerchantProfile merchantProfile);

    void deleteByMerchantProfile(MerchantProfile merchantProfile);

    long countByMerchantProfile_User_Id(UUID userId);
}
