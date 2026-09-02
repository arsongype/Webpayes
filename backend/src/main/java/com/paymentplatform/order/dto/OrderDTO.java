package com.paymentplatform.order.dto;

import com.paymentplatform.order.entity.Order;
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
public class OrderDTO {
    private UUID id;
    private UUID buyerId;
    private String buyerName;
    private UUID productId;
    private String productName;
    private Integer quantity;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private String paymentReference;
    private Instant createdAt;
    private Instant updatedAt;
}
