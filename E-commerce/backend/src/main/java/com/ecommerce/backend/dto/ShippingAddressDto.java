package com.ecommerce.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ShippingAddressDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String email,
        String phone,
        @NotBlank String address,
        @NotBlank String city,
        @NotBlank String postalCode,
        @NotBlank String country
) {}
