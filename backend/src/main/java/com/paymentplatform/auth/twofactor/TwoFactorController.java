package com.paymentplatform.auth.twofactor;

import com.paymentplatform.auth.dto.TwoFactorRecoveryResponse;
import com.paymentplatform.auth.dto.TwoFactorSetupResponse;
import com.paymentplatform.auth.dto.TwoFactorStatusResponse;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.qrcode.service.QrCodeService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth/two-factor")
@RequiredArgsConstructor
public class TwoFactorController {

    private final TwoFactorService twoFactorService;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final QrCodeService qrCodeService;

    @PostMapping("/setup")
    public ResponseEntity<TwoFactorSetupResponse> setup() {
        String accountName = currentUserService.getCurrentUserEmail();
        String secret = twoFactorService.generateSecret(accountName).getKey();
        String qrCodeUrl = twoFactorService.getQrCodeUrl(secret, accountName, "WebPaysh");
        String qrDataUrl = qrCodeService.generateQrDataUrl(qrCodeUrl);
        return ResponseEntity.ok(new TwoFactorSetupResponse(secret, qrCodeUrl, qrDataUrl));
    }

    @PostMapping("/enable")
    public ResponseEntity<Void> enable(@RequestParam String secret, @RequestParam int code) {
        if (!twoFactorService.verifyCode(secret, code)) {
            throw new BusinessException("Code incorrect", HttpStatus.BAD_REQUEST);
        }
        User user = currentUserService.getCurrentUser();
        List<String> recoveryCodes = twoFactorService.generateRecoveryCodes(8);
        user.setTwoFactorEnabled(true);
        user.setTwoFactorSecret(secret);
        user.setTwoFactorRecoveryCodes(twoFactorService.encryptRecoveryCodes(recoveryCodes, user.getEmail()));
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/disable")
    public ResponseEntity<Void> disable(@RequestParam(required = false) Integer code, @RequestParam(required = false) String recoveryCode) {
        User user = currentUserService.getCurrentUser();
        boolean valid = false;
        if (code != null && user.getTwoFactorSecret() != null) {
            valid = twoFactorService.verifyCode(user.getTwoFactorSecret(), code);
        }
        if (!valid && recoveryCode != null && !recoveryCode.isBlank()) {
            valid = twoFactorService.verifyRecoveryCode(user.getTwoFactorRecoveryCodes(), recoveryCode, user.getEmail());
        }
        if (!valid) {
            throw new BusinessException("Code incorrect", HttpStatus.BAD_REQUEST);
        }
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        user.setTwoFactorRecoveryCodes(null);
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<TwoFactorStatusResponse> status() {
        return ResponseEntity.ok(new TwoFactorStatusResponse(currentUserService.getCurrentUser().isTwoFactorEnabled()));
    }

    @GetMapping("/recovery-codes")
    public ResponseEntity<TwoFactorRecoveryResponse> recoveryCodes() {
        User user = currentUserService.getCurrentUser();
        String codes = user.getTwoFactorRecoveryCodes();
        if (codes == null || codes.isBlank()) {
            return ResponseEntity.ok(new TwoFactorRecoveryResponse(List.of()));
        }
        List<String> decryptedCodes = twoFactorService.decryptRecoveryCodes(codes, user.getEmail());
        return ResponseEntity.ok(new TwoFactorRecoveryResponse(decryptedCodes));
    }

    @PostMapping("/recovery-codes/regenerate")
    public ResponseEntity<TwoFactorRecoveryResponse> regenerateRecoveryCodes() {
        User user = currentUserService.getCurrentUser();
        List<String> recoveryCodes = twoFactorService.generateRecoveryCodes(8);
        user.setTwoFactorRecoveryCodes(twoFactorService.encryptRecoveryCodes(recoveryCodes, user.getEmail()));
        userRepository.save(user);
        return ResponseEntity.ok(new TwoFactorRecoveryResponse(recoveryCodes));
    }

    @PostMapping("/verify-qr")
    public ResponseEntity<Boolean> verifyQr(@RequestParam String secret, @RequestParam int code) {
        boolean valid = twoFactorService.verifyCode(secret, code);
        return ResponseEntity.ok(valid);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/reset")
    public ResponseEntity<Void> adminReset(@RequestParam String email) {
        User target = userRepository.findAll().stream()
            .filter(u -> u.getEmail().equalsIgnoreCase(email))
            .findFirst()
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        target.setTwoFactorEnabled(false);
        target.setTwoFactorSecret(null);
        target.setTwoFactorRecoveryCodes(null);
        userRepository.save(target);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/emergency-reset")
    public ResponseEntity<Void> emergencyReset(@RequestParam String email) {
        User target = userRepository.findAll().stream()
            .filter(u -> u.getEmail().equalsIgnoreCase(email))
            .findFirst()
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        target.setTwoFactorEnabled(false);
        target.setTwoFactorSecret(null);
        target.setTwoFactorRecoveryCodes(null);
        userRepository.save(target);
        return ResponseEntity.ok().build();
    }
}
