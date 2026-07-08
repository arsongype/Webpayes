package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ProductCreateRequest(
        @NotBlank String name,
        String description,
        @NotNull @Positive BigDecimal price,
        BigDecimal originalPrice,
        @NotBlank String sku,
        String imageUrl,
        @NotNull Long categoryId,
        @NotNull Integer stockQuantity,
        Boolean isNew,
        Boolean featured
) {}
