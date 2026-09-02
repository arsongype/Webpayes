package com.paymentplatform.agent.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_agents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAgent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "api_key_hash", nullable = false, unique = true, length = 255)
    private String apiKeyHash;

    @Column(name = "api_key_prefix", nullable = false, unique = true, length = 20)
    private String apiKeyPrefix;

    @Column(name = "budget_daily", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal budgetDaily = BigDecimal.ZERO;

    @Column(name = "budget_monthly", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal budgetMonthly = BigDecimal.ZERO;

    @Column(name = "spent_daily", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal spentDaily = BigDecimal.ZERO;

    @Column(name = "spent_monthly", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal spentMonthly = BigDecimal.ZERO;

    @Column(name = "budget_reset_at")
    private Instant budgetResetAt;

    @Column(name = "owner_user_id")
    private UUID ownerUserId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "allowed_payment_methods", length = 255)
    private String allowedPaymentMethods;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
