package com.paymentplatform.vault.repository;

import com.paymentplatform.vault.entity.VaultToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VaultRepository extends JpaRepository<VaultToken, UUID> {
    Optional<VaultToken> findByToken(String token);

    List<VaultToken> findByUserIdAndActiveTrue(UUID userId);

    Optional<VaultToken> findByPanHash(String panHash);

    void deleteByUserId(UUID userId);
}
