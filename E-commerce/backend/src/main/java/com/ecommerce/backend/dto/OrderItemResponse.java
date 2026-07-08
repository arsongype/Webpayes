package com.ecommerce.backend.dto;

import com.ecommerce.backend.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderItemResponse(
        Long productId,
        String name,
        String imageUrl,
        Integer quantity,
        BigDecimal price,
        BigDecimal unitPrice,
        ProductSummary product
) {
    public record ProductSummary(String name, String imageUrl) {}
}
