package com.paymentplatform.auth.dto;

import java.util.List;

public record TwoFactorRecoveryResponse(
        List<String> recoveryCodes
) {
}
