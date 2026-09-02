package com.paymentplatform.auth.twofactor;

import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import com.warrenstrange.googleauth.IGoogleAuthenticator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class TwoFactorService {
    
        private final IGoogleAuthenticator googleAuthenticator = new GoogleAuthenticator();
    
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

    public boolean verifyRecoveryCode(String recoveryCodes, String inputCode) {
        if (recoveryCodes == null || recoveryCodes.isBlank()) return false;
        String[] codes = recoveryCodes.split(",");
        for (String code : codes) {
            if (code.trim().equals(inputCode.trim())) {
                return true;
            }
        }
        return false;
    }
}
