package com.ecommerce.backend.repository;

import com.ecommerce.backend.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);

    List<Product> findByFeaturedTrue();

    List<Product> findByIsNewTrue();

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id <> :productId")
    List<Product> findRelated(@Param("categoryId") Long categoryId, @Param("productId") Long productId, Pageable pageable);
}
