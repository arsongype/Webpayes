package com.paymentplatform.paymentmethod.repository;

import com.paymentplatform.paymentmethod.entity.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {

    List<PaymentMethod> findByUserId(UUID userId);

    List<PaymentMethod> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<PaymentMethod> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndIsActiveTrue(UUID userId);

    void deleteByUserId(UUID userId);
}
