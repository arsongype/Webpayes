package com.paymentplatform.agent.repository;

import com.paymentplatform.agent.entity.AgentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AgentTransactionRepository extends JpaRepository<AgentTransaction, UUID> {
}
