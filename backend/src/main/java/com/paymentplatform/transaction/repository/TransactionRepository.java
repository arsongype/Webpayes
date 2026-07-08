package com.paymentplatform.transaction.repository;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Page<Transaction> findBySenderAccountOrReceiverAccount(Account senderAccount, Account receiverAccount, Pageable pageable);
    Optional<Transaction> findByReference(String reference);
    long countByStatus(TransactionStatus status);
}