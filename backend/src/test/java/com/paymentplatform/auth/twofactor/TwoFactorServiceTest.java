package com.paymentplatform.auth.twofactor;

import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TwoFactorServiceTest {

    private TwoFactorService twoFactorService;

    @BeforeEach
    void setUp() {
        twoFactorService = new TwoFactorService();
    }

    @Test
    void generateSecret_returnsValidKey() {
        GoogleAuthenticatorKey key = twoFactorService.generateSecret("test@example.com");

        assertNotNull(key);
        assertNotNull(key.getKey());
        assertFalse(key.getKey().isEmpty());
    }

    @Test
    void generateSecret_differentAccounts_produceDifferentKeys() {
        GoogleAuthenticatorKey key1 = twoFactorService.generateSecret("user1@example.com");
        GoogleAuthenticatorKey key2 = twoFactorService.generateSecret("user2@example.com");

        assertNotNull(key1);
        assertNotNull(key2);
        assertNotEquals(key1.getKey(), key2.getKey());
    }

    @Test
    void getQrCodeUrl_returnsValidOtpauthUrl() {
        String secret = "JBSWY3DPEHPK3PXP";
        String accountName = "test@example.com";
        String issuer = "WebPayes";

        String qrUrl = twoFactorService.getQrCodeUrl(secret, accountName, issuer);

        assertNotNull(qrUrl);
        assertTrue(qrUrl.startsWith("otpauth://totp/"));
        assertTrue(qrUrl.contains("secret=" + secret));
        assertTrue(qrUrl.contains("issuer="));
        assertTrue(qrUrl.contains("test%40example.com"));
    }

    @Test
    void verifyCode_invalidCode_returnsFalse() {
        String secret = "JBSWY3DPEHPK3PXP";

        boolean result = twoFactorService.verifyCode(secret, 123456);

        assertFalse(result);
    }

    @Test
    void generateRecoveryCodes_defaultCount_returns8Codes() {
        List<String> codes = twoFactorService.generateRecoveryCodes(8);

        assertNotNull(codes);
        assertEquals(8, codes.size());
        for (String code : codes) {
            assertNotNull(code);
            assertEquals(6, code.length());
            assertTrue(code.matches("\\d{6}"));
        }
    }

    @Test
    void generateRecoveryCodes_customCount_returnsCorrectCount() {
        List<String> codes = twoFactorService.generateRecoveryCodes(8);

        assertNotNull(codes);
        assertEquals(8, codes.size());
    }

    @Test
    void generateRecoveryCodes_differentCalls_produceDifferentCodes() {
        List<String> codes1 = twoFactorService.generateRecoveryCodes(5);
        List<String> codes2 = twoFactorService.generateRecoveryCodes(5);

        assertNotEquals(codes1, codes2);
    }

    @Test
    void verifyRecoveryCode_validCode_returnsTrue() {
        List<String> codes = List.of("123456", "789012", "345678");
        String encrypted = twoFactorService.encryptRecoveryCodes(codes, "test@example.com");

        boolean result = twoFactorService.verifyRecoveryCode(encrypted, "789012", "test@example.com");

        assertTrue(result);
    }

    @Test
    void verifyRecoveryCode_invalidCode_returnsFalse() {
        List<String> codes = List.of("123456", "789012", "345678");
        String encrypted = twoFactorService.encryptRecoveryCodes(codes, "test@example.com");

        boolean result = twoFactorService.verifyRecoveryCode(encrypted, "000000", "test@example.com");

        assertFalse(result);
    }

    @Test
    void verifyRecoveryCode_nullCodes_returnsFalse() {
        boolean result = twoFactorService.verifyRecoveryCode(null, "123456", "test@example.com");

        assertFalse(result);
    }

    @Test
    void verifyRecoveryCode_blankCodes_returnsFalse() {
        boolean result = twoFactorService.verifyRecoveryCode("", "123456", "test@example.com");

        assertFalse(result);
    }

    @Test
    void encryptRecoveryCodes_returnsEncryptedString() {
        List<String> codes = List.of("123456", "789012", "345678");

        String encrypted = twoFactorService.encryptRecoveryCodes(codes, "test@example.com");

        assertNotNull(encrypted);
        assertFalse(encrypted.isBlank());
        assertNotEquals(codes.toString(), encrypted);
    }

    @Test
    void decryptRecoveryCodes_returnsOriginalCodes() {
        List<String> originalCodes = List.of("123456", "789012", "345678");
        String encrypted = twoFactorService.encryptRecoveryCodes(originalCodes, "test@example.com");

        List<String> decrypted = twoFactorService.decryptRecoveryCodes(encrypted, "test@example.com");

        assertNotNull(decrypted);
        assertEquals(3, decrypted.size());
        assertEquals("123456", decrypted.get(0));
        assertEquals("789012", decrypted.get(1));
        assertEquals("345678", decrypted.get(2));
    }

    @Test
    void decryptRecoveryCodes_differentEmail_returnsEmpty() {
        List<String> originalCodes = List.of("123456", "789012");
        String encrypted = twoFactorService.encryptRecoveryCodes(originalCodes, "user1@example.com");

        List<String> decrypted = twoFactorService.decryptRecoveryCodes(encrypted, "user2@example.com");

        assertNotNull(decrypted);
        assertTrue(decrypted.isEmpty());
    }

    @Test
    void decryptRecoveryCodes_nullEncrypted_returnsEmpty() {
        List<String> decrypted = twoFactorService.decryptRecoveryCodes(null, "test@example.com");

        assertNotNull(decrypted);
        assertTrue(decrypted.isEmpty());
    }

    @Test
    void decryptRecoveryCodes_blankEncrypted_returnsEmpty() {
        List<String> decrypted = twoFactorService.decryptRecoveryCodes("", "test@example.com");

        assertNotNull(decrypted);
        assertTrue(decrypted.isEmpty());
    }
}
