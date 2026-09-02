package com.paymentplatform.auth.dto;

public record TwoFactorSetupResponse(
        String secret,
        String qrCodeUrl,
        String qrDataUrl
) {
}
