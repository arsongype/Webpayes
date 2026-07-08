package com.paymentplatform.account.repository;

import com.paymentplatform.account.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByUserId(UUID userId);

    Optional<Account> findByAccountNumber(String accountNumber);

}
