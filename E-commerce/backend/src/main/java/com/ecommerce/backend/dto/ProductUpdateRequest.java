package com.ecommerce.backend.dto;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String description,
        BigDecimal price,
        BigDecimal originalPrice,
        String sku,
        String imageUrl,
        Long categoryId,
        Integer stockQuantity,
        Boolean isNew,
        Boolean featured
) {}
