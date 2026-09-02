package com.paymentplatform.merchant.service;

import com.paymentplatform.merchant.entity.MerchantApiKey;
import com.paymentplatform.merchant.repository.MerchantApiKeyRepository;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MerchantApiKeyService {

    private final MerchantApiKeyRepository apiKeyRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final CurrentUserService currentUserService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    public ApiKeyResponse generateApiKey(String name) {
        User user = currentUserService.getCurrentUser();

        MerchantProfile profile = merchantProfileRepository.findByUserId(user.getId())
                .orElse(null);

        if (profile == null) {
            throw new IllegalStateException("Aucun profil marchand associé à cet utilisateur.");
        }

        String rawKey = generateRawApiKey();
        String prefix = rawKey.substring(0, Math.min(8, rawKey.length()));
        String hashedKey = passwordEncoder.encode(rawKey);

        MerchantApiKey apiKey = MerchantApiKey.builder()
                .merchantProfile(profile)
                .apiKeyHash(hashedKey)
                .apiKeyPrefix(prefix)
                .name(name)
                .active(true)
                .expiresAt(Instant.now().plus(365, ChronoUnit.DAYS))
                .build();

        apiKeyRepository.save(apiKey);

        return ApiKeyResponse.builder()
                .keyId(apiKey.getId())
                .apiKey(rawKey)
                .name(name)
                .prefix(prefix)
                .createdAt(apiKey.getCreatedAt())
                .expiresAt(apiKey.getExpiresAt())
                .build();
    }

    public boolean validateApiKey(String rawApiKey) {
        if (rawApiKey == null || rawApiKey.isBlank()) {
            return false;
        }
        String prefix = rawApiKey.substring(0, Math.min(8, rawApiKey.length()));

        List<MerchantApiKey> keys = apiKeyRepository.findAll().stream()
                .filter(k -> k.getApiKeyPrefix().equals(prefix) && k.isActive())
                .toList();

        for (MerchantApiKey key : keys) {
            if (passwordEncoder.matches(rawApiKey, key.getApiKeyHash())) {
                key.setLastUsedAt(Instant.now());
                apiKeyRepository.save(key);
                return true;
            }
        }
        return false;
    }

    public Optional<MerchantApiKey> validateAndGetApiKey(String rawApiKey) {
        if (rawApiKey == null || rawApiKey.isBlank()) {
            return Optional.empty();
        }
        String prefix = rawApiKey.substring(0, Math.min(8, rawApiKey.length()));

        return apiKeyRepository.findAll().stream()
                .filter(k -> k.getApiKeyPrefix().equals(prefix) && k.isActive())
                .filter(k -> passwordEncoder.matches(rawApiKey, k.getApiKeyHash()))
                .findFirst()
                .map(key -> {
                    key.setLastUsedAt(Instant.now());
                    apiKeyRepository.save(key);
                    return key;
                });
    }

    public List<ApiKeyListResponse> listApiKeys() {
        User user = currentUserService.getCurrentUser();
        return merchantProfileRepository.findByUserId(user.getId())
                .map(profile -> apiKeyRepository.findByMerchantProfileAndActiveTrue(profile).stream()
                        .map(k -> ApiKeyListResponse.builder()
                                .keyId(k.getId())
                                .name(k.getName())
                                .prefix(k.getApiKeyPrefix())
                                .createdAt(k.getCreatedAt())
                                .expiresAt(k.getExpiresAt())
                                .lastUsedAt(k.getLastUsedAt())
                                .active(k.isActive())
                                .build())
                        .toList())
                .orElse(java.util.Collections.emptyList());
    }

    public void revokeApiKey(UUID keyId) {
        MerchantApiKey key = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new EntityNotFoundException("Clé API non trouvée"));
        key.setActive(false);
        apiKeyRepository.save(key);
    }

    private String generateRawApiKey() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return "pk_" + java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ApiKeyResponse {
        private UUID keyId;
        private String apiKey;
        private String name;
        private String prefix;
        private Instant createdAt;
        private Instant expiresAt;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ApiKeyListResponse {
        private UUID keyId;
        private String name;
        private String prefix;
        private Instant createdAt;
        private Instant expiresAt;
        private Instant lastUsedAt;
        private boolean active;
    }
}
