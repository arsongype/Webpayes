package com.ecommerce.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        String sku,
        String imageUrl,
        List<String> images,
        CategoryResponse category,
        Integer stockQuantity,
        Double rating,
        Integer reviewCount,
        Boolean isNew,
        Boolean featured,
        LocalDateTime createdAt
) {}
