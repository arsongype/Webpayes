package com.paymentplatform.agent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agent_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentTransaction {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "agent_id", nullable = false)
    private UUID agentId;

    @Column(name = "transaction_ref", nullable = false, length = 64)
    private String transactionRef;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "budget_before_daily", nullable = false, precision = 19, scale = 4)
    private BigDecimal budgetBeforeDaily;

    @Column(name = "budget_before_monthly", nullable = false, precision = 19, scale = 4)
    private BigDecimal budgetBeforeMonthly;

    @Column(name = "budget_after_daily", nullable = false, precision = 19, scale = 4)
    private BigDecimal budgetAfterDaily;

    @Column(name = "budget_after_monthly", nullable = false, precision = 19, scale = 4)
    private BigDecimal budgetAfterMonthly;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
