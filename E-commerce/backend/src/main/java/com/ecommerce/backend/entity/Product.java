package com.ecommerce.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Lob
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "image_url")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(nullable = false)
    private Double rating;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount;

    @Column(name = "is_new", nullable = false)
    private Boolean isNew;

    @Column(nullable = false)
    private Boolean featured;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
        if (rating == null) {
            rating = 0.0;
        }
        if (reviewCount == null) {
            reviewCount = 0;
        }
        if (isNew == null) {
            isNew = false;
        }
        if (featured == null) {
            featured = false;
        }
    }
}
