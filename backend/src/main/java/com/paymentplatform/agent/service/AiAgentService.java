package com.paymentplatform.agent.service;

import com.paymentplatform.agent.entity.AiAgent;
import com.paymentplatform.agent.entity.AgentTransaction;
import com.paymentplatform.agent.exception.BudgetExceededException;
import com.paymentplatform.agent.exception.InvalidApiKeyException;
import com.paymentplatform.agent.repository.AiAgentRepository;
import com.paymentplatform.agent.repository.AgentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AiAgentService {

    private final AiAgentRepository aiAgentRepository;
    private final AgentTransactionRepository agentTransactionRepository;
    private final PasswordEncoder passwordEncoder;

    public AiAgent createAgent(String name, BigDecimal dailyBudget, BigDecimal monthlyBudget,
                               String allowedPaymentMethods, UUID ownerUserId) {
        if (aiAgentRepository.existsByName(name)) {
            throw new IllegalArgumentException("Un agent avec ce nom existe déjà");
        }

        String apiKey = generateApiKey();
        String apiKeyHash = passwordEncoder.encode(apiKey);
        String apiKeyPrefix = "ak_" + apiKey.substring(0, 12);

        AiAgent agent = AiAgent.builder()
                .name(name)
                .apiKeyHash(apiKeyHash)
                .apiKeyPrefix(apiKeyPrefix)
                .budgetDaily(dailyBudget)
                .budgetMonthly(monthlyBudget)
                .spentDaily(BigDecimal.ZERO)
                .spentMonthly(BigDecimal.ZERO)
                .budgetResetAt(Instant.now().plus(1, ChronoUnit.DAYS))
                .ownerUserId(ownerUserId)
                .active(true)
                .allowedPaymentMethods(allowedPaymentMethods)
                .build();

        return aiAgentRepository.save(agent);
    }

    public AiAgent authenticate(String apiKey) {
        if (apiKey == null || !apiKey.startsWith("ak_")) {
            throw new InvalidApiKeyException("Format de clé API invalide");
        }

        String apiKeyPrefix = "ak_" + apiKey.substring(3, 15);
        AiAgent agent = aiAgentRepository.findByApiKeyPrefix(apiKeyPrefix)
                .orElseThrow(() -> new InvalidApiKeyException("Clé API invalide"));

        if (!passwordEncoder.matches(apiKey, agent.getApiKeyHash())) {
            throw new InvalidApiKeyException("Clé API invalide");
        }

        if (!agent.getActive()) {
            throw new InvalidApiKeyException("Agent désactivé");
        }

        return agent;
    }

    public void resetBudgetsIfNeeded(AiAgent agent) {
        Instant now = Instant.now();
        if (now.isAfter(agent.getBudgetResetAt())) {
            agent.setSpentDaily(BigDecimal.ZERO);
            agent.setBudgetResetAt(now.plus(1, ChronoUnit.DAYS));
            aiAgentRepository.save(agent);
        }
    }

    public boolean checkBudget(AiAgent agent, BigDecimal amount, String currency) {
        if (!"MGA".equals(currency)) {
            log.warn("Agent {} attempted non-MGA payment: {}", agent.getName(), currency);
            return false;
        }

        if (agent.getSpentDaily().add(amount).compareTo(agent.getBudgetDaily()) > 0) {
            log.warn("Agent {} daily budget exceeded: spent={} requested={} limit={}",
                    agent.getName(), agent.getSpentDaily(), amount, agent.getBudgetDaily());
            return false;
        }

        if (agent.getSpentMonthly().add(amount).compareTo(agent.getBudgetMonthly()) > 0) {
            log.warn("Agent {} monthly budget exceeded: spent={} requested={} limit={}",
                    agent.getName(), agent.getSpentMonthly(), amount, agent.getBudgetMonthly());
            return false;
        }

        return true;
    }

    public void deductBudget(AiAgent agent, BigDecimal amount, String currency,
                             String transactionRef, String paymentMethod, String status) {
        BigDecimal oldSpentDaily = agent.getSpentDaily();
        BigDecimal oldSpentMonthly = agent.getSpentMonthly();

        agent.setSpentDaily(oldSpentDaily.add(amount));
        agent.setSpentMonthly(oldSpentMonthly.add(amount));
        aiAgentRepository.save(agent);

        AgentTransaction txn = AgentTransaction.builder()
                .agentId(agent.getId())
                .transactionRef(transactionRef)
                .amount(amount)
                .currency(currency)
                .paymentMethod(paymentMethod)
                .status(status)
                .budgetBeforeDaily(oldSpentDaily)
                .budgetBeforeMonthly(oldSpentMonthly)
                .budgetAfterDaily(agent.getSpentDaily())
                .budgetAfterMonthly(agent.getSpentMonthly())
                .build();

        agentTransactionRepository.save(txn);
    }

    private String generateApiKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
