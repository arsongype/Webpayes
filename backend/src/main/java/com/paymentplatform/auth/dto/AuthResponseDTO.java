package com.paymentplatform.auth.dto;

import java.util.UUID;

public record AuthResponseDTO(
        String accessToken,
        String tokenType,
        UserSummary user,
        boolean twoFactorRequired,
        boolean twoFactorSetupRequired
) {
    public AuthResponseDTO(String accessToken, String tokenType, UserSummary user, boolean twoFactorRequired) {
        this(accessToken, tokenType, user, twoFactorRequired, false);
    }
    public record UserSummary(
            UUID id,
            String firstName,
            String lastName,
            String email,
            String role,
            String accountNumber,
            boolean twoFactorEnabled
    ) {
    }
}
