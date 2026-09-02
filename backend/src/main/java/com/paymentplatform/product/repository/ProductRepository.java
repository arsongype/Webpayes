package com.paymentplatform.product.repository;

import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Page<Product> findByActiveTrueAndMerchant_Id(UUID merchantId, Pageable pageable);
    Page<Product> findByActiveTrue(Pageable pageable);
    List<Product> findByMerchant_Id(UUID merchantId);
}
