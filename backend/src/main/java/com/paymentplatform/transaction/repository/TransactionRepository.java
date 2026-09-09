package com.paymentplatform.transaction.repository;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    @EntityGraph(attributePaths = {"senderAccount", "receiverAccount"})
    Page<Transaction> findBySenderAccountOrReceiverAccount(Account senderAccount, Account receiverAccount, Pageable pageable);

    Optional<Transaction> findByReference(String reference);
    long countByStatus(TransactionStatus status);

    List<Transaction> findByStatusAndCreatedAtBetween(TransactionStatus status, Instant from, Instant to);

    List<Transaction> findBySenderAccount_User_IdAndStatus(UUID userId, TransactionStatus status);

    List<Transaction> findByReceiverAccountAndStatusAndCreatedAtBetween(Account receiverAccount, TransactionStatus status, java.time.Instant from, java.time.Instant to);

    List<Transaction> findByReferenceContainingIgnoreCase(String reference);

    Page<Transaction> findBySenderAccountOrReceiverAccountAndCreatedAtBetween(
            Account senderAccount, Account receiverAccount, Instant from, Instant to, Pageable pageable);

    long countBySenderAccount_User_IdOrReceiverAccount_User_Id(UUID senderId, UUID receiverId);

    Page<Transaction> findBySenderAccount_User_IdOrReceiverAccount_User_Id(UUID senderId, UUID receiverId, Pageable pageable);

    List<Transaction> findBySenderAccount_User_IdOrReceiverAccount_User_Id(UUID senderId, UUID receiverId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE (t.senderAccount.user.id = :merchantUserId OR t.receiverAccount.user.id = :merchantUserId) AND t.createdAt BETWEEN :from AND :to AND t.status = 'COMPLETED'")
    BigDecimal getTotalSalesForMerchant(UUID merchantUserId, Instant from, Instant to);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE (t.senderAccount.user.id = :merchantUserId OR t.receiverAccount.user.id = :merchantUserId) AND t.createdAt BETWEEN :from AND :to AND t.status = 'COMPLETED'")
    long getSalesCountForMerchant(UUID merchantUserId, Instant from, Instant to);
}