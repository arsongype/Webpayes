package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank @Size(min = 2) String firstName,
        @NotBlank @Size(min = 2) String lastName,
        String phone
) {}
