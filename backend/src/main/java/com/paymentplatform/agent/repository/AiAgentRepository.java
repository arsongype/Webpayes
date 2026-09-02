package com.paymentplatform.agent.repository;

import com.paymentplatform.agent.entity.AiAgent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiAgentRepository extends JpaRepository<AiAgent, UUID> {
    Optional<AiAgent> findByApiKeyHash(String apiKeyHash);
    Optional<AiAgent> findByApiKeyPrefix(String apiKeyPrefix);
    boolean existsByName(String name);
}
