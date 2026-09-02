package com.paymentplatform.vault.service;

import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.vault.dto.DetokenizeRequest;
import com.paymentplatform.vault.dto.DetokenizeResponse;
import com.paymentplatform.vault.dto.TokenizeRequest;
import com.paymentplatform.vault.dto.TokenizeResponse;
import com.paymentplatform.vault.entity.VaultToken;
import com.paymentplatform.vault.repository.VaultRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VaultService {

    private final VaultRepository vaultRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    @Value("${jwt.secret}")
    private String encryptionKey;

    private SecretKey secretKey;
    private SecureRandom secureRandom;

    @PostConstruct
    public void init() throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] keyBytes = digest.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
        this.secureRandom = new SecureRandom();
    }

    public TokenizeResponse tokenize(TokenizeRequest request) {
        User user = currentUserService.getCurrentUser();
        String pan = request.getPan();

        String panHash = hashPan(pan);
        Optional<VaultToken> existing = vaultRepository.findByPanHash(panHash);
        if (existing.isPresent() && existing.get().isActive()) {
            VaultToken token = existing.get();
            auditService.log("VAULT_TOKENIZE", "TOKENIZE_REUSED", AuditEvent.Outcome.SUCCESS,
                "VAULT_TOKEN", token.getToken(),
                "Token existant réutilisé", Map.of("panLast4", token.getPanLast4()));
            return TokenizeResponse.builder()
                    .token(token.getToken())
                    .panLast4(token.getPanLast4())
                    .cardBrand(token.getCardBrand())
                    .expiryMonth(token.getExpiryMonth())
                    .expiryYear(token.getExpiryYear())
                    .message("Token existant récupéré")
                    .build();
        }

        String token = generateToken();
        String encryptedPan = encrypt(pan);

        String panLast4 = pan.length() >= 4 ? pan.substring(pan.length() - 4) : pan;

        VaultToken vaultToken = VaultToken.builder()
                .user(user)
                .token(token)
                .encryptedPan(encryptedPan)
                .panHash(panHash)
                .panLast4(panLast4)
                .expiryMonth(request.getExpiryMonth())
                .expiryYear(request.getExpiryYear())
                .cardBrand(detectCardBrand(pan))
                .active(true)
                .expiresAt(Instant.now().plus(365, ChronoUnit.DAYS))
                .build();

        vaultRepository.save(vaultToken);

        auditService.log("VAULT_TOKENIZE", "TOKENIZE", AuditEvent.Outcome.SUCCESS,
            "VAULT_TOKEN", vaultToken.getToken(),
            "PAN chiffré et tokenisé (AES-256-GCM)",
            Map.of("panLast4", vaultToken.getPanLast4(), "brand", vaultToken.getCardBrand()));

        return TokenizeResponse.builder()
                .token(token)
                .panLast4(panLast4)
                .cardBrand(vaultToken.getCardBrand())
                .expiryMonth(request.getExpiryMonth())
                .expiryYear(request.getExpiryYear())
                .message("Carte tokenisée avec succès")
                .build();
    }

    public DetokenizeResponse detokenize(DetokenizeRequest request) {
        String token = request.getToken();
        VaultToken vaultToken = vaultRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token invalide"));

        if (!vaultToken.isActive()) {
            throw new IllegalStateException("Token inactif");
        }

        if (vaultToken.getExpiresAt() != null && Instant.now().isAfter(vaultToken.getExpiresAt())) {
            throw new IllegalStateException("Token expiré");
        }

        String pan = decrypt(vaultToken.getEncryptedPan());

        auditService.log("VAULT_DETOKENIZE", "DETOKENIZE", AuditEvent.Outcome.SUCCESS,
            "VAULT_TOKEN", vaultToken.getToken(),
            "PAN déchiffré pour traitement",
            Map.of("panLast4", vaultToken.getPanLast4(), "reason", request.getReason() != null ? request.getReason() : "n/a"));

        return DetokenizeResponse.builder()
                .pan(pan)
                .panLast4(vaultToken.getPanLast4())
                .cardBrand(vaultToken.getCardBrand())
                .expiryMonth(vaultToken.getExpiryMonth())
                .expiryYear(vaultToken.getExpiryYear())
                .build();
    }

    public void deactivateToken(String token) {
        VaultToken vaultToken = vaultRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Token invalide"));
        vaultToken.setActive(false);
        vaultRepository.save(vaultToken);
    }

    private String generateToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashPan(String pan) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(pan.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du hashage du PAN", e);
        }
    }

    private String encrypt(String data) {
        try {
            byte[] iv = new byte[12];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du chiffrement", e);
        }
    }

    private String decrypt(String encryptedData) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedData);
            byte[] iv = new byte[12];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            byte[] cipherText = new byte[combined.length - iv.length];
            System.arraycopy(combined, iv.length, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
            byte[] decrypted = cipher.doFinal(cipherText);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du déchiffrement", e);
        }
    }

    private String detectCardBrand(String pan) {
        if (pan == null || pan.isEmpty()) return "UNKNOWN";
        if (pan.startsWith("4")) return "VISA";
        if (pan.startsWith("5") || (pan.startsWith("2") && pan.length() >= 2 && pan.charAt(1) >= '2' && pan.charAt(1) <= '7')) return "MASTERCARD";
        if (pan.startsWith("34") || pan.startsWith("37")) return "AMERICAN Express";
        if (pan.startsWith("6011") || pan.startsWith("64") || pan.startsWith("65")) return "DISCOVER";
        return "UNKNOWN";
    }
}
