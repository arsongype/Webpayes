package com.paymentplatform.agent.controller;

import com.paymentplatform.agent.dto.AgentPaymentRequest;
import com.paymentplatform.agent.entity.AiAgent;
import com.paymentplatform.agent.exception.BudgetExceededException;
import com.paymentplatform.agent.service.AiAgentService;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentMethodType;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.service.PaymentService;
import com.paymentplatform.payment.enums.MobileMoneyOperator;
import com.paymentplatform.security.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Slf4j
public class AgentController {

    private final AiAgentService aiAgentService;
    private final PaymentService paymentService;
    private final CurrentUserService currentUserService;

    @PostMapping("/payments/process")
    public ResponseEntity<?> processAgentPayment(
            HttpServletRequest request,
            @Valid @RequestBody AgentPaymentRequest agentRequest) {

        AiAgent agent = (AiAgent) request.getAttribute("agent");
        if (agent == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\":\"Agent non authentifié\"}");
        }

        BigDecimal amount = BigDecimal.valueOf(agentRequest.getAmount());

        aiAgentService.resetBudgetsIfNeeded(agent);

        if (!aiAgentService.checkBudget(agent, amount, agentRequest.getCurrency())) {
            throw new BudgetExceededException(
                    String.format("Budget dépassé pour l'agent %s. Budget quotidien: %s, mensuel: %s",
                            agent.getName(), agent.getBudgetDaily(), agent.getBudgetMonthly()));
        }

        PaymentRequest paymentRequest = PaymentRequest.builder()
                .token(agentRequest.getToken())
                .paymentMethod(parsePaymentMethod(agentRequest.getPaymentMethod()))
                .provider(parseProvider(agentRequest.getProvider()))
                .amount(agentRequest.getAmount())
                .currency(agentRequest.getCurrency())
                .mobileMoneyPhone(agentRequest.getMobileMoneyPhone())
                .mobileMoneyOperator(parseOperator(agentRequest.getMobileMoneyOperator()))
                .cardHolderName(agentRequest.getDestinationFirstName() + " " + agentRequest.getDestinationLastName())
                .destinationAccount(agentRequest.getDestinationAccount())
                .description(agentRequest.getDescription())
                .previousTransactionId(agentRequest.getPreviousTransactionId())
                .threeDsAuthCode(agentRequest.getThreeDsAuthCode())
                .isOneClick(agentRequest.getIsOneClick())
                .build();

        PaymentResponse response = paymentService.processPayment(paymentRequest);

        String txnRef = response.getTransactionReference() != null ? response.getTransactionReference() : UUID.randomUUID().toString();
        String paymentMethod = response.getPaymentMethod() != null ? response.getPaymentMethod().name() : "UNKNOWN";

        aiAgentService.deductBudget(agent,
                BigDecimal.valueOf(agentRequest.getAmount()),
                agentRequest.getCurrency(),
                txnRef,
                paymentMethod,
                response.getStatus().name());

        log.info("Agent {} processed payment: amount={}, status={}, budgetRemaining={}/{}",
                agent.getName(), amount, response.getStatus(),
                agent.getBudgetDaily().subtract(agent.getSpentDaily()), agent.getBudgetDaily());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/budget")
    public ResponseEntity<?> getAgentBudget(HttpServletRequest request) {
        AiAgent agent = (AiAgent) request.getAttribute("agent");
        if (agent == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"error\":\"Agent non authentifié\"}");
        }

        aiAgentService.resetBudgetsIfNeeded(agent);
        return ResponseEntity.ok(agent);
    }

    private PaymentMethodType parsePaymentMethod(String method) {
        if (method == null) return PaymentMethodType.CARD;
        try {
            return PaymentMethodType.valueOf(method.toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethodType.CARD;
        }
    }

    private PaymentProvider parseProvider(String provider) {
        if (provider == null) return null;
        try {
            return PaymentProvider.valueOf(provider.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private MobileMoneyOperator parseOperator(String operator) {
        if (operator == null) return null;
        try {
            return MobileMoneyOperator.valueOf(operator.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
