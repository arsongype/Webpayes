package com.paymentplatform.agent.controller;

import com.paymentplatform.agent.entity.AiAgent;
import com.paymentplatform.agent.service.AiAgentService;
import com.paymentplatform.security.CurrentUserService;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/agents")
@RequiredArgsConstructor
public class AdminAgentController {

    private final AiAgentService aiAgentService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AgentCreateResponse> createAgent(@RequestBody AgentCreateRequest request) {
        UUID ownerId = request.getOwnerUserId() != null
                ? request.getOwnerUserId()
                : currentUserService.getCurrentUserId();

        BigDecimal daily = request.getBudgetDaily() != null ? request.getBudgetDaily() : new BigDecimal("100000");
        BigDecimal monthly = request.getBudgetMonthly() != null ? request.getBudgetMonthly() : new BigDecimal("1000000");

        AiAgent agent = aiAgentService.createAgent(
                request.getName(),
                daily,
                monthly,
                request.getAllowedPaymentMethods(),
                ownerId
        );

        return ResponseEntity.ok(AgentCreateResponse.builder()
                .agentId(agent.getId())
                .name(agent.getName())
                .apiKeyPrefix(agent.getApiKeyPrefix())
                .budgetDaily(agent.getBudgetDaily())
                .budgetMonthly(agent.getBudgetMonthly())
                .build());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AgentCreateRequest {
        @NotBlank
        private String name;
        private BigDecimal budgetDaily;
        private BigDecimal budgetMonthly;
        private String allowedPaymentMethods;
        private UUID ownerUserId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AgentCreateResponse {
        private UUID agentId;
        private String name;
        private String apiKeyPrefix;
        private BigDecimal budgetDaily;
        private BigDecimal budgetMonthly;
    }
}
