package com.ecommerce.backend.dto;

import com.ecommerce.backend.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        Role role,
        LocalDateTime createdAt
) {}
