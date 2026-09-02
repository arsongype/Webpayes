package com.paymentplatform.merchant.controller;

import com.paymentplatform.auth.twofactor.TwoFactorService;
import com.paymentplatform.merchant.service.MerchantApiKeyService;
import com.paymentplatform.merchant.service.MerchantApiKeyService.ApiKeyListResponse;
import com.paymentplatform.merchant.service.MerchantApiKeyService.ApiKeyResponse;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/merchant")
@RequiredArgsConstructor
public class MerchantApiKeyController {

    private final MerchantApiKeyService apiKeyService;
    private final TwoFactorService twoFactorService;
    private final CurrentUserService currentUserService;

    @PostMapping("/api-keys")
    public ResponseEntity<ApiKeyResponse> generateApiKey(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-2FA-Code", required = false) String twoFactorCode) {
        User user = currentUserService.getCurrentUser();

        if (user.isTwoFactorEnabled()) {
            if (twoFactorCode == null || twoFactorCode.isBlank() ||
                !twoFactorService.verifyCode(user.getTwoFactorSecret(), Integer.parseInt(twoFactorCode))) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        }

        String name = body.getOrDefault("name", "Default API Key");
        ApiKeyResponse response = apiKeyService.generateApiKey(name);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api-keys")
    public ResponseEntity<List<ApiKeyListResponse>> listApiKeys() {
        return ResponseEntity.ok(apiKeyService.listApiKeys());
    }

    @PostMapping("/api-keys/{keyId}/revoke")
    public ResponseEntity<Void> revokeApiKey(@PathVariable UUID keyId) {
        apiKeyService.revokeApiKey(keyId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate-key")
    public ResponseEntity<Map<String, Boolean>> validateApiKey(@RequestBody Map<String, String> body) {
        String key = body.get("apiKey");
        boolean valid = apiKeyService.validateApiKey(key);
        return ResponseEntity.ok(Map.of("valid", valid));
    }
}
