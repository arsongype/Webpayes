package com.paymentplatform.transaction.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.wallet.service.WalletService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final WalletService walletService;
    private final CurrentUserService currentUserService;
    private final ConcurrentHashMap<UUID, CopyOnWriteArrayList<SseEmitter>> emittersByUser = new ConcurrentHashMap<>();

    public TransactionService(TransactionRepository transactionRepository,
                              AccountRepository accountRepository,
                              WalletService walletService,
                              CurrentUserService currentUserService) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
        this.walletService = walletService;
        this.currentUserService = currentUserService;
    }

    public SseEmitter streamBalance() {
        UUID userId = currentUserService.getCurrentUserId();
        SseEmitter emitter = new SseEmitter(300_000L);
        emittersByUser.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(e -> removeEmitter(userId, emitter));

        try {
            Account account = accountRepository.findByUserId(userId).orElse(null);
            Map<String, Object> data = Map.of(
                    "userId", userId.toString(),
                    "balance", account != null ? account.getBalance() : BigDecimal.ZERO,
                    "currency", account != null ? account.getCurrency() : "MGA"
            );
            emitter.send(SseEmitter.event().name("balance").data(data));
        } catch (Exception e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    @Transactional
    public TransferResponseDTO transfer(TransferRequestDTO request) {
        UUID senderId = UUID.fromString(request.getSenderAccountId());
        UUID receiverId = UUID.fromString(request.getReceiverAccountId());
        BigDecimal amount = request.getAmount();

        if (senderId.equals(receiverId)) {
            throw new BusinessException("L'expéditeur et le récepteur doivent être différents", HttpStatus.BAD_REQUEST);
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant doit être supérieur à zéro", HttpStatus.BAD_REQUEST);
        }

        UUID firstLockId = senderId.compareTo(receiverId) < 0 ? senderId : receiverId;
        UUID secondLockId = senderId.compareTo(receiverId) < 0 ? receiverId : senderId;
        Account firstLockedAccount = accountRepository.findByIdForUpdate(firstLockId)
            .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));
        Account secondLockedAccount = accountRepository.findByIdForUpdate(secondLockId)
            .orElseThrow(() -> new BusinessException("Compte introuvable", HttpStatus.NOT_FOUND));
        Account sender = senderId.equals(firstLockId) ? firstLockedAccount : secondLockedAccount;
        Account receiver = receiverId.equals(firstLockId) ? firstLockedAccount : secondLockedAccount;

        if (!sender.getUser().isEnabled()) {
            throw new BusinessException("Le compte expéditeur n'est pas activé. Veuillez contacter l'administration.", HttpStatus.FORBIDDEN);
        }

        if (!receiver.getUser().isEnabled()) {
            throw new BusinessException("Le compte récepteur n'est pas activé. Veuillez contacter l'administration.", HttpStatus.FORBIDDEN);
        }

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("Solde insuffisant", HttpStatus.BAD_REQUEST);
        }

        Transaction tx = Transaction.builder()
                .senderAccount(sender)
                .receiverAccount(receiver)
                .amount(amount)
                .currency(sender.getCurrency())
            .status(TransactionStatus.PENDING)
                .reference("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        walletService.withdraw(sender.getUser().getId(), false, sender.getId(), amount, "Transfert vers " + receiver.getAccountNumber());
        walletService.deposit(receiver.getUser().getId(), false, receiver.getId(), amount, "Transfert depuis " + sender.getAccountNumber());
        tx.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(tx);

        UUID senderUserId = sender.getUser().getId();
        UUID receiverUserId = receiver.getUser().getId();

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    sendBalanceUpdate(senderUserId);
                    sendBalanceUpdate(receiverUserId);
                }
            });
        } else {
            sendBalanceUpdate(senderUserId);
            sendBalanceUpdate(receiverUserId);
        }

        return TransferResponseDTO.builder()
                .id(tx.getId())
                .reference(tx.getReference())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .status(tx.getStatus())
                .senderAccountId(sender.getId())
                .receiverAccountId(receiver.getId())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private void sendBalanceUpdate(UUID userId) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters == null || emitters.isEmpty()) {
            return;
        }

        Account account = accountRepository.findByUserId(userId).orElse(null);
        Map<String, Object> data = Map.of(
                "userId", userId.toString(),
                "balance", account != null ? account.getBalance() : BigDecimal.ZERO,
                "currency", account != null ? account.getCurrency() : "MGA"
        );

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("balance").data(data));
            } catch (Exception e) {
                removeEmitter(userId, emitter);
            }
        }
    }

    private void removeEmitter(UUID userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = emittersByUser.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                emittersByUser.remove(userId);
            }
        }
    }

    public List<Transaction> listTransactions(UUID currentUserId, boolean isAdmin, int page, int size) {
        Account account = isAdmin ? null : accountRepository.findByUserId(currentUserId).orElse(null);
        if (account == null && !isAdmin) {
            return List.of();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        if (isAdmin) {
            return transactionRepository.findAll(pageable).getContent();
        }

        return transactionRepository.findBySenderAccount_User_IdOrReceiverAccount_User_Id(currentUserId, currentUserId, pageable).getContent();
    }

    public List<Transaction> searchTransactions(UUID currentUserId, boolean isAdmin, String reference, TransactionStatus status, Instant from, Instant to) {
        if (isAdmin) {
            return transactionRepository.findAll().stream()
                    .filter(tx -> reference == null || reference.isBlank() || tx.getReference().contains(reference))
                    .filter(tx -> status == null || tx.getStatus().equals(status))
                    .filter(tx -> from == null || tx.getCreatedAt().isAfter(from))
                    .filter(tx -> to == null || tx.getCreatedAt().isBefore(to))
                    .collect(Collectors.toList());
        }

        return transactionRepository.findBySenderAccount_User_IdOrReceiverAccount_User_Id(currentUserId, currentUserId).stream()
                .filter(tx -> reference == null || reference.isBlank() || tx.getReference().contains(reference))
                .filter(tx -> status == null || tx.getStatus().equals(status))
                .filter(tx -> from == null || tx.getCreatedAt().isAfter(from))
                .filter(tx -> to == null || tx.getCreatedAt().isBefore(to))
                .collect(Collectors.toList());
    }

    public Transaction getTransaction(UUID id, UUID currentUserId, boolean isAdmin) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Transaction introuvable", HttpStatus.NOT_FOUND));

        if (!isAdmin) {
            boolean isSender = tx.getSenderAccount().getUser().getId().equals(currentUserId);
            boolean isReceiver = tx.getReceiverAccount() != null && tx.getReceiverAccount().getUser().getId().equals(currentUserId);
            if (!isSender && !isReceiver) {
                throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
            }
        }

        return tx;
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

    public BigDecimal getMerchantSalesTotal(UUID merchantUserId, Instant from, Instant to) {
        return transactionRepository.getTotalSalesForMerchant(merchantUserId, from, to);
    }

    public long getMerchantSalesCount(UUID merchantUserId, Instant from, Instant to) {
        return transactionRepository.getSalesCountForMerchant(merchantUserId, from, to);
    }

}
