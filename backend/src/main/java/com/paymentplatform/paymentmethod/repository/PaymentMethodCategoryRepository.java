package com.paymentplatform.paymentmethod.repository;

import com.paymentplatform.paymentmethod.entity.PaymentMethodCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentMethodCategoryRepository extends JpaRepository<PaymentMethodCategory, UUID> {

    Optional<PaymentMethodCategory> findByName(String name);

    boolean existsByName(String name);
}
