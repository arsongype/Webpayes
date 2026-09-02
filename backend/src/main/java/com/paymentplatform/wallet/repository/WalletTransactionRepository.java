package com.paymentplatform.wallet.repository;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.wallet.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    List<WalletTransaction> findByAccountOrderByCreatedAtDesc(Account account);

    List<WalletTransaction> findByCreatedAtBetween(Instant from, Instant to);
}
