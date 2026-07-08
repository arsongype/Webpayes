package com.ecommerce.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.List;

public record CreateOrderRequest(
        @Valid @NotNull ShippingAddressDto shippingAddress,
        @Valid @NotEmpty List<OrderItemRequest> items,
        @NotNull @Positive BigDecimal totalAmount
) {}
