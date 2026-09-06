package com.paymentplatform.transaction.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.auth.twofactor.TwoFactorService;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final LedgerService ledgerService;
    private final CurrentUserService currentUserService;
    private final WalletService walletService;
    private final TwoFactorService twoFactorService;
    private final com.paymentplatform.aiclient.FraudDetectionClient fraudDetectionClient;
    private final com.paymentplatform.aiclient.RiskScoringClient riskScoringClient;
    private final com.paymentplatform.operator.OperatorClientRegistry operatorClientRegistry;
    private final com.paymentplatform.notification.service.NotificationService notificationService;

    @Transactional
        public TransferResponseDTO transfer(TransferRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();

        Account sender;
        if (request.getSenderAccountId() == null || request.getSenderAccountId().isBlank()) {
            // no sender provided: use current user's primary account (wallet)
            sender = accountRepository.findByUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Compte émetteur introuvable", HttpStatus.NOT_FOUND));
        } else {
            sender = resolveInternalAccount(request.getSenderAccountId())
                .orElseThrow(() -> new BusinessException("Compte émetteur introuvable", HttpStatus.NOT_FOUND));
        }

        if (!sender.getUser().getId().equals(currentUserId) && !currentUserService.isCurrentUserAdmin()) {
            throw new BusinessException("Accès refusé au compte émetteur", HttpStatus.FORBIDDEN);
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant doit être positif", HttpStatus.BAD_REQUEST);
        }

        if (sender.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Solde insuffisant", HttpStatus.BAD_REQUEST);
        }

        String reference = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();

        // If receiverOperator is provided and not 'none', treat as external mobile money transfer
        boolean isExternal = request.getReceiverOperator() != null && !request.getReceiverOperator().isBlank() && !request.getReceiverOperator().equalsIgnoreCase("none");

        Transaction transaction;
        Transaction saved;

        if (isExternal) {
            // external transfer: create transaction without internal receiver account
            transaction = Transaction.builder()
                .senderAccount(sender)
                .amount(request.getAmount())
                .currency(sender.getCurrency())
                .status(TransactionStatus.PENDING)
                .reference(reference)
                .metadata(buildMetadata(request.getDescription()) +
                    "|{\"external\":true,\"operator\":\"" + request.getReceiverOperator() + "\",\"to\":\"" + request.getReceiverAccountId() + "\"}")
                .build();

            saved = transactionRepository.save(transaction);

            // ledger: only debit sender (external payout handled off-ledger by operator)
            LedgerEntry debitEntry = LedgerEntry.builder()
                .transactionId(saved.getId())
                .accountId(sender.getId())
                .entryType(LedgerEntry.EntryType.DEBIT)
                .amount(request.getAmount())
                .currency(sender.getCurrency())
                .build();

            ledgerService.saveEntries(List.of(debitEntry));

            // withdraw from sender wallet
            walletService.withdraw(currentUserService.getCurrentUserId(), currentUserService.isCurrentUserAdmin(), sender.getId(), request.getAmount(), "Transfert externe vers " + request.getReceiverOperator() + " " + request.getReceiverAccountId());

            // lookup operator client
            com.paymentplatform.operator.OperatorClient client = operatorClientRegistry.get(request.getReceiverOperator());
            if (client == null) {
                throw new BusinessException("Opérateur non supporté: " + request.getReceiverOperator(), HttpStatus.BAD_REQUEST);
            }

            com.paymentplatform.operator.OperatorResponse opResp = client.sendPayout(request.getReceiverAccountId(), request.getAmount(), sender.getCurrency(), Map.of("reference", reference, "description", request.getDescription()));

            if (opResp != null && opResp.isSuccess()) {
                saved.setStatus(TransactionStatus.COMPLETED);
                // append operator external id to metadata
                saved.setMetadata(saved.getMetadata() + "|{\"operatorExternalId\":\"" + (opResp.getExternalId() != null ? opResp.getExternalId() : "") + "\"}");
            } else {
                // leave as pending and record message
                saved.setStatus(TransactionStatus.PENDING);
                saved.setMetadata(saved.getMetadata() + "|{\"operatorMessage\":\"" + (opResp != null ? opResp.getMessage() : "no-response") + "\"}");
            }

            // Fraud/Risk with external metadata
        com.paymentplatform.aiclient.FraudDetectionRequest fraudRequest = com.paymentplatform.aiclient.FraudDetectionRequest.builder()
            .transactionId(saved.getId().toString())
            .amount(saved.getAmount())
            .currency(saved.getCurrency())
            .senderAccountId(saved.getSenderAccount().getId().toString())
            .receiverAccountId(saved.getReceiverAccount() != null ? saved.getReceiverAccount().getId().toString() : null)
            .metadata(Map.of("description", request.getDescription(), "operator", request.getReceiverOperator()))
            .build();
        com.paymentplatform.aiclient.FraudDetectionResponse fraudResponse = fraudDetectionClient.analyze(fraudRequest);
        saved.setFraudScore(fraudResponse.getFraudScore());

        com.paymentplatform.aiclient.RiskScoringRequest riskRequest = com.paymentplatform.aiclient.RiskScoringRequest.builder()
            .transactionId(saved.getId().toString())
            .amount(saved.getAmount())
            .currency(saved.getCurrency())
            .senderAccountId(saved.getSenderAccount().getId().toString())
            .receiverAccountId(saved.getReceiverAccount() != null ? saved.getReceiverAccount().getId().toString() : null)
            .metadata(Map.of("description", request.getDescription(), "operator", request.getReceiverOperator()))
            .build();
            com.paymentplatform.aiclient.RiskScoringResponse riskResponse = riskScoringClient.score(riskRequest);
            saved.setRiskScore(riskResponse.getRiskScore());

            transactionRepository.save(saved);

            try {
                notificationService.sendTransactionNotification(saved);
            } catch (Exception e) {
                // log but do not fail the transaction
            }

            return toResponse(saved);
        }

        // Internal transfer (existing behavior)
        Account receiver = resolveInternalAccount(request.getReceiverAccountId())
            .orElseThrow(() -> new BusinessException("Compte destinataire introuvable", HttpStatus.NOT_FOUND));

        transaction = Transaction.builder()
            .senderAccount(sender)
            .receiverAccount(receiver)
            .amount(request.getAmount())
            .currency(sender.getCurrency())
            .status(TransactionStatus.COMPLETED)
            .reference(reference)
            .metadata(buildMetadata(request.getDescription()))
            .build();

        saved = transactionRepository.save(transaction);

        LedgerEntry debitEntry = LedgerEntry.builder()
            .transactionId(saved.getId())
            .accountId(sender.getId())
            .entryType(LedgerEntry.EntryType.DEBIT)
            .amount(request.getAmount())
            .currency(sender.getCurrency())
            .build();

        LedgerEntry creditEntry = LedgerEntry.builder()
            .transactionId(saved.getId())
            .accountId(receiver.getId())
            .entryType(LedgerEntry.EntryType.CREDIT)
            .amount(request.getAmount())
            .currency(receiver.getCurrency())
            .build();

        ledgerService.saveEntries(List.of(debitEntry, creditEntry));

        User currentUser = currentUserService.getCurrentUser();
        if (currentUser.isTwoFactorEnabled()) {
            if (request.getTwoFactorCode() == null || request.getTwoFactorCode().isBlank()) {
                throw new BusinessException("Un code 2FA est requis pour effectuer ce retrait", HttpStatus.FORBIDDEN);
            }
            if (!twoFactorService.verifyCode(currentUser.getTwoFactorSecret(), Integer.parseInt(request.getTwoFactorCode()))) {
                throw new BusinessException("Code 2FA invalide", HttpStatus.FORBIDDEN);
            }
        }

        walletService.withdraw(currentUserService.getCurrentUserId(), currentUserService.isCurrentUserAdmin(), sender.getId(), request.getAmount(), "Transfert vers " + receiver.getAccountNumber());
        walletService.deposit(receiver.getUser().getId(), true, receiver.getId(), request.getAmount(), "Transfert depuis " + sender.getAccountNumber());

        com.paymentplatform.aiclient.FraudDetectionRequest fraudRequest = com.paymentplatform.aiclient.FraudDetectionRequest.builder()
            .transactionId(saved.getId().toString())
            .amount(saved.getAmount())
            .currency(saved.getCurrency())
            .senderAccountId(saved.getSenderAccount().getId().toString())
            .receiverAccountId(saved.getReceiverAccount().getId().toString())
            .metadata(Map.of("description", request.getDescription()))
            .build();
        com.paymentplatform.aiclient.FraudDetectionResponse fraudResponse = fraudDetectionClient.analyze(fraudRequest);
        saved.setFraudScore(fraudResponse.getFraudScore());

        com.paymentplatform.aiclient.RiskScoringRequest riskRequest = com.paymentplatform.aiclient.RiskScoringRequest.builder()
            .transactionId(saved.getId().toString())
            .amount(saved.getAmount())
            .currency(saved.getCurrency())
            .senderAccountId(saved.getSenderAccount().getId().toString())
            .receiverAccountId(saved.getReceiverAccount().getId().toString())
            .metadata(Map.of("description", request.getDescription()))
            .build();
        com.paymentplatform.aiclient.RiskScoringResponse riskResponse = riskScoringClient.score(riskRequest);
        saved.setRiskScore(riskResponse.getRiskScore());

        transactionRepository.save(saved);

        try {
            notificationService.sendTransactionNotification(saved);
        } catch (Exception e) {
            // log but do not fail the transaction
        }

        return toResponse(saved);
    }

    public List<Transaction> listTransactions(UUID currentUserId, boolean isAdmin, int page, int size) {
        Account account = isAdmin ? null : accountRepository.findByUserId(currentUserId).orElse(null);
        if (account == null && !isAdmin) {
            return List.of();
        }

        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));

        if (isAdmin) {
            return transactionRepository.findAll(pageable).getContent();
        }

        return transactionRepository.findBySenderAccountOrReceiverAccount(account, account, pageable).getContent();
    }

    public List<Transaction> searchTransactions(UUID currentUserId, boolean isAdmin, String reference, TransactionStatus status, java.time.Instant from, java.time.Instant to) {
        if (isAdmin) {
            if (reference != null && !reference.isBlank()) {
                return transactionRepository.findByReferenceContainingIgnoreCase(reference)
                        .stream().collect(java.util.stream.Collectors.toList());
            }
            if (status != null && from != null && to != null) {
                return transactionRepository.findByStatusAndCreatedAtBetween(status, from, to);
            }
            return transactionRepository.findAll();
        }

        Account account = accountRepository.findByUserId(currentUserId).orElse(null);
        if (account == null) {
            return List.of();
        }

        java.util.List<Transaction> all = transactionRepository.findBySenderAccountOrReceiverAccount(
                account, account, org.springframework.data.domain.PageRequest.of(0, 1000, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        ).getContent();

        if (reference != null && !reference.isBlank()) {
            String q = reference.toLowerCase();
            all = all.stream().filter(t -> t.getReference() != null && t.getReference().toLowerCase().contains(q)).collect(java.util.stream.Collectors.toList());
        }
        if (status != null) {
            all = all.stream().filter(t -> t.getStatus() == status).collect(java.util.stream.Collectors.toList());
        }
        if (from != null && to != null) {
            all = all.stream().filter(t -> t.getCreatedAt() != null && !t.getCreatedAt().isBefore(from) && !t.getCreatedAt().isAfter(to)).collect(java.util.stream.Collectors.toList());
        }
        return all;
    }

    public java.math.BigDecimal getMerchantSalesTotal(UUID merchantUserId, java.time.Instant from, java.time.Instant to) {
        Account merchantAccount = accountRepository.findByUserId(merchantUserId).orElse(null);
        if (merchantAccount == null) {
            return java.math.BigDecimal.ZERO;
        }
        List<Transaction> sales = transactionRepository.findByReceiverAccountAndStatusAndCreatedAtBetween(
                merchantAccount, TransactionStatus.COMPLETED, from, to
        );
        return sales.stream().map(com.paymentplatform.transaction.entity.Transaction::getAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
    }

    public long getMerchantSalesCount(UUID merchantUserId, java.time.Instant from, java.time.Instant to) {
        Account merchantAccount = accountRepository.findByUserId(merchantUserId).orElse(null);
        if (merchantAccount == null) {
            return 0;
        }
        return transactionRepository.findByReceiverAccountAndStatusAndCreatedAtBetween(
                merchantAccount, TransactionStatus.COMPLETED, from, to
        ).size();
    }

    public Transaction getTransaction(UUID id, UUID currentUserId, boolean isAdmin) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Transaction introuvable", HttpStatus.NOT_FOUND));

        Account sender = transaction.getSenderAccount();
        if (!isAdmin && !sender.getUser().getId().equals(currentUserId)) {
            Account receiver = transaction.getReceiverAccount();
            if (receiver != null && receiver.getUser().getId().equals(currentUserId)) {
                return transaction;
            }
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        return transaction;
    }

    public long countTotalTransactions() {
        return transactionRepository.count();
    }

    public long countCompletedTransactions() {
        return transactionRepository.countByStatus(TransactionStatus.COMPLETED);
    }

    public long countFailedTransactions() {
        return transactionRepository.countByStatus(TransactionStatus.FAILED);
    }

    private String buildMetadata(String description) {
        return "{\"description\":\"" + (description != null ? description.replace("\"", "'") : "") + "\"}";
    }

    private TransferResponseDTO toResponse(Transaction transaction) {
        return TransferResponseDTO.builder()
                .id(transaction.getId())
                .senderAccountId(transaction.getSenderAccount().getId())
                .receiverAccountId(transaction.getReceiverAccount() != null ? transaction.getReceiverAccount().getId() : null)
                .amount(transaction.getAmount())
                .currency(transaction.getCurrency())
                .status(transaction.getStatus())
                .reference(transaction.getReference())
                .fraudScore(transaction.getFraudScore())
                .riskScore(transaction.getRiskScore())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private Optional<Account> resolveInternalAccount(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }
        try {
            UUID accountId = UUID.fromString(identifier);
            return accountRepository.findById(accountId);
        } catch (IllegalArgumentException ignored) {
            return accountRepository.findByAccountNumber(identifier);
        }
    }
}