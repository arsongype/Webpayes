package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<Order> findByOrderNumber(String orderNumber);

    Optional<Order> findByIdAndUserId(Long id, Long userId);
}
