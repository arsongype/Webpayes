package com.paymentplatform.auth.dto;

import java.util.UUID;

public record RegisterResponseDTO(
        String message,
        UserSummary user
) {
    public record UserSummary(
            UUID id,
            String firstName,
            String lastName,
            String email,
            String role,
            String accountNumber
    ) {
    }
}
