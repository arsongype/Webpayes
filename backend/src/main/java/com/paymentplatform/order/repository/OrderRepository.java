package com.paymentplatform.order.repository;

import com.paymentplatform.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Page<Order> findByBuyer_Id(UUID buyerId, Pageable pageable);
    List<Order> findByProduct_Merchant_Id(UUID merchantId);
}
