package com.paymentplatform.payout.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.payout.dto.PayoutDTOs;
import com.paymentplatform.payout.entity.Payout;
import com.paymentplatform.payout.repository.PayoutRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.wallet.WalletTransactionType;
import com.paymentplatform.wallet.entity.WalletTransaction;
import com.paymentplatform.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final AccountRepository accountRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    @Transactional
    public PayoutDTOs.PayoutResponse createPayout(PayoutDTOs.CreatePayoutRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();

        Account account = accountRepository.findById(request.getAccountId())
            .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        if (!isAdmin && !account.getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Solde insuffisant pour effectuer le versement", HttpStatus.BAD_REQUEST);
        }

        UUID merchantId = resolveMerchantId(account.getUser().getId());

        Payout payout = Payout.builder()
            .merchantId(merchantId != null ? merchantId : account.getUser().getId())
            .accountId(account.getId())
            .amount(request.getAmount())
            .currency(request.getCurrency() != null ? request.getCurrency() : account.getCurrency())
            .destinationType(request.getDestinationType())
            .destinationReference(request.getDestinationReference())
            .destinationName(request.getDestinationName())
            .bankCode(request.getBankCode())
            .iban(request.getIban())
            .bic(request.getBic())
            .status(Payout.PayoutStatus.PENDING)
            .provider(resolveProvider(request.getDestinationType()))
            .scheduledAt(Instant.now())
            .createdBy(userId)
            .build();

        payout = payoutRepository.save(payout);
        auditService.log("PAYOUT", "PAYOUT_CREATE", AuditEvent.Outcome.SUCCESS,
            "PAYOUT", payout.getId().toString(),
            "Versement créé",
            Map.of("amount", payout.getAmount().toString(), "currency", payout.getCurrency(),
                   "destinationType", payout.getDestinationType().name(),
                   "destination", payout.getDestinationReference()));
        log.info("Payout {} created by user {} for amount {} {}", payout.getId(), userId, request.getAmount(), payout.getCurrency());

        executePayout(payout.getId());
        return PayoutDTOs.PayoutResponse.from(payout);
    }

    @Transactional
    public Payout executePayout(UUID payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
            .orElseThrow(() -> new BusinessException("Versement introuvable", HttpStatus.NOT_FOUND));

        if (payout.getStatus() != Payout.PayoutStatus.PENDING) {
            return payout;
        }

        Account account = accountRepository.findById(payout.getAccountId())
            .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));

        payout.setStatus(Payout.PayoutStatus.PROCESSING);
        payout = payoutRepository.save(payout);

        PayoutGateway.PayoutResult result = switch (payout.getDestinationType()) {
            case BANK_ACCOUNT -> PayoutGateway.executeBankTransfer(payout);
            case MOBILE_MONEY -> PayoutGateway.executeMobileMoney(payout);
        };

        if (result.isSuccess()) {
            account.setBalance(account.getBalance().subtract(payout.getAmount()));
            accountRepository.save(account);

            WalletTransaction txn = WalletTransaction.builder()
                .account(account)
                .type(WalletTransactionType.WITHDRAWAL)
                .amount(payout.getAmount())
                .currency(payout.getCurrency())
                .description("Payout #" + payout.getId() + " → " + payout.getDestinationReference())
                .build();
            walletTransactionRepository.save(txn);

            payout.setStatus(Payout.PayoutStatus.COMPLETED);
            payout.setExternalId(result.getExternalId());
            payout.setExecutedAt(Instant.now());
            auditService.log("PAYOUT", "PAYOUT_COMPLETED", AuditEvent.Outcome.SUCCESS,
                "PAYOUT", payout.getId().toString(),
                "Versement exécuté avec succès",
                Map.of("externalId", result.getExternalId(), "amount", payout.getAmount().toString()));
            log.info("Payout {} completed: externalId={}", payout.getId(), result.getExternalId());
        } else {
            payout.setStatus(Payout.PayoutStatus.FAILED);
            payout.setFailureReason(result.getMessage());
            auditService.log("PAYOUT", "PAYOUT_FAILED", AuditEvent.Outcome.FAILURE,
                "PAYOUT", payout.getId().toString(),
                "Échec du versement: " + result.getMessage(), null);
            log.warn("Payout {} failed: {}", payout.getId(), result.getMessage());
        }

        return payoutRepository.save(payout);
    }

    public Page<Payout> listMine(Pageable pageable) {
        UUID userId = currentUserService.getCurrentUserId();
        UUID merchantId = resolveMerchantId(userId);
        return payoutRepository.findByMerchantIdOrderByCreatedAtDesc(merchantId != null ? merchantId : userId, pageable);
    }

    public Page<Payout> listAll(Pageable pageable, Payout.PayoutStatus status) {
        if (!currentUserService.isCurrentUserAdmin()) {
            throw new BusinessException("Accès admin requis", HttpStatus.FORBIDDEN);
        }
        return status != null
            ? payoutRepository.findByStatusOrderByCreatedAtDesc(status, pageable)
            : payoutRepository.findAll(pageable);
    }

    public Payout getById(UUID id) {
        Payout p = payoutRepository.findById(id)
            .orElseThrow(() -> new BusinessException("Versement introuvable", HttpStatus.NOT_FOUND));
        if (!currentUserService.isCurrentUserAdmin()) {
            UUID userId = currentUserService.getCurrentUserId();
            if (!p.getMerchantId().equals(userId) && !p.getCreatedBy().equals(userId)) {
                throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
            }
        }
        return p;
    }

    @Transactional
    public Payout cancel(UUID id) {
        Payout p = getById(id);
        if (p.getStatus() != Payout.PayoutStatus.PENDING) {
            throw new BusinessException("Seuls les versements en attente peuvent être annulés", HttpStatus.BAD_REQUEST);
        }
        p.setStatus(Payout.PayoutStatus.CANCELLED);
        log.info("Payout {} cancelled by {}", id, currentUserService.getCurrentUserEmail());
        return payoutRepository.save(p);
    }

    public PayoutDTOs.PayoutSummary summary() {
        UUID userId = currentUserService.getCurrentUserId();
        UUID merchantId = resolveMerchantId(userId);
        UUID id = merchantId != null ? merchantId : userId;

        long total = payoutRepository.findByMerchantIdOrderByCreatedAtDesc(id, org.springframework.data.domain.PageRequest.of(0, 1)).getTotalElements();
        long pending = payoutRepository.countByMerchantIdAndStatus(id, Payout.PayoutStatus.PENDING);
        long processing = payoutRepository.countByMerchantIdAndStatus(id, Payout.PayoutStatus.PROCESSING);
        long completed = payoutRepository.countByMerchantIdAndStatus(id, Payout.PayoutStatus.COMPLETED);
        long failed = payoutRepository.countByMerchantIdAndStatus(id, Payout.PayoutStatus.FAILED);

        return PayoutDTOs.PayoutSummary.builder()
            .total(total)
            .pending(pending)
            .processing(processing)
            .completed(completed)
            .failed(failed)
            .totalAmount(BigDecimal.ZERO)
            .completedAmount(BigDecimal.ZERO)
            .build();
    }

    @Async
    public void processPendingPayouts() {
        List<Payout> pending = payoutRepository.findTop100ByStatusOrderByScheduledAtAsc(Payout.PayoutStatus.PENDING);
        for (Payout p : pending) {
            try {
                executePayout(p.getId());
            } catch (Exception e) {
                log.error("Failed to process payout {}: {}", p.getId(), e.getMessage());
            }
        }
    }

    private UUID resolveMerchantId(UUID userId) {
        return merchantProfileRepository.findByUserId(userId)
            .map(MerchantProfile::getId)
            .orElse(null);
    }

    private String resolveProvider(Payout.DestinationType type) {
        return switch (type) {
            case BANK_ACCOUNT -> "SEPA";
            case MOBILE_MONEY -> "MOBILE_MONEY_USSD";
        };
    }
}
