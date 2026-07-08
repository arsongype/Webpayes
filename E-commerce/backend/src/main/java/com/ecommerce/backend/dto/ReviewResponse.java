package com.ecommerce.backend.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        Long id,
        Integer rating,
        String comment,
        String userName,
        LocalDateTime createdAt
) {}
