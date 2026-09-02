package com.paymentplatform.product.dto;

import com.paymentplatform.product.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private UUID id;
    private UUID merchantId;
    private String name;
    private String description;
    private BigDecimal price;
    private String currency;
    private String imageUrl;
    private Integer stock;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
