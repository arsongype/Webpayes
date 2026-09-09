package com.paymentplatform.auth.twofactor;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.IGoogleAuthenticator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final IGoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();

    @Value("${jwt.secret}")
    private String encryptionKey;

    public GoogleAuthenticatorKey generateSecret(String accountName) {
        GoogleAuthenticator authenticator = new GoogleAuthenticator();
        authenticator.setCredentialRepository(new InMemoryCredentialRepository());
        return authenticator.createCredentials(accountName);
    }

    public String getQrCodeUrl(String secret, String accountName, String issuer) {
        try {
            String encodedIssuer = URLEncoder.encode(issuer, StandardCharsets.UTF_8.name());
            String encodedAccount = URLEncoder.encode(accountName, StandardCharsets.UTF_8.name());
            return "otpauth://totp/" + encodedIssuer + ":" + encodedAccount + "?secret=" + secret + "&issuer=" + encodedIssuer;
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }

    public boolean verifyCode(String secret, int code) {
        return googleAuthenticator.authorize(secret, code);
    }

    public List<String> generateRecoveryCodes(int count) {
        SecureRandom random = new SecureRandom();
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            int code = 100000 + random.nextInt(900000);
            codes.add(String.valueOf(code));
        }
        return codes;
    }

    public boolean verifyRecoveryCode(String recoveryCodes, String inputCode, String userEmail) {
        if (recoveryCodes == null || recoveryCodes.isBlank()) return false;
        List<String> decrypted = decryptRecoveryCodes(recoveryCodes, userEmail);
        for (String code : decrypted) {
            if (code.equals(inputCode)) {
                return true;
            }
        }
        return false;
    }

    public String encryptRecoveryCodes(List<String> codes, String userEmail) {
        try {
            String joined = String.join(",", codes);
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest((encryptionKey + ":" + userEmail).getBytes(StandardCharsets.UTF_8));
            SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);
            byte[] encrypted = cipher.doFinal(joined.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt recovery codes", e);
        }
    }

    public List<String> decryptRecoveryCodes(String encryptedCodes, String userEmail) {
        if (encryptedCodes == null || encryptedCodes.isBlank()) {
            return new ArrayList<>();
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest((encryptionKey + ":" + userEmail).getBytes(StandardCharsets.UTF_8));
            SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");
            byte[] combined = Base64.getDecoder().decode(encryptedCodes);
            byte[] iv = new byte[12];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, spec);
            byte[] cipherText = new byte[combined.length - iv.length];
            System.arraycopy(combined, iv.length, cipherText, 0, cipherText.length);
            String decrypted = new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
            List<String> codes = new ArrayList<>();
            for (String code : decrypted.split(",")) {
                if (!code.isBlank()) {
                    codes.add(code.trim());
                }
            }
            return codes;
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
