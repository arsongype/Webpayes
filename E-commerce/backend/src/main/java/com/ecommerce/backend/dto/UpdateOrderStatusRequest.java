package com.ecommerce.backend.dto;

import com.ecommerce.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(@NotNull OrderStatus status) {}
