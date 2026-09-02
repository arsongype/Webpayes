package com.paymentplatform.user.controller;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.merchant.repository.MerchantApiKeyRepository;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.user.dto.ProfileResponse;
import com.paymentplatform.user.dto.UserDTO;
import com.paymentplatform.user.dto.UserRequestDTO;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import com.paymentplatform.security.CurrentUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final MerchantApiKeyRepository apiKeyRepository;
    private final AuditService auditService;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          CurrentUserService currentUserService,
                          AccountRepository accountRepository,
                          TransactionRepository transactionRepository,
                          MerchantApiKeyRepository apiKeyRepository,
                          AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.apiKeyRepository = apiKeyRepository;
        this.auditService = auditService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> list() {
        List<UserDTO> dtos = userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> create(@RequestBody UserRequestDTO body) {
        if (userRepository.existsByEmail(body.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        User u = User.builder()
                .firstName(body.getFirstName())
                .lastName(body.getLastName())
                .email(body.getEmail())
                .passwordHash(passwordEncoder.encode(body.getPassword()))
                .role(body.getRole() == null ? com.paymentplatform.common.constants.Role.USER : body.getRole())
                .enabled(body.getEnabled() == null ? true : body.getEnabled())
                .phoneNumber(body.getPhoneNumber())
                .cin(body.getCin())
                .dateOfBirth(body.getDateOfBirth())
                .nationality(body.getNationality())
                .preferredLanguage(body.getPreferredLanguage() != null ? body.getPreferredLanguage() : "fr")
                .timezone(body.getTimezone() != null ? body.getTimezone() : "Africa/Nairobi")
                .build();
        userRepository.save(u);
        return ResponseEntity.ok(toDto(u));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable UUID id, @RequestBody UserRequestDTO body) {
        return userRepository.findById(id).map(u -> {
            applyUpdates(u, body);
            userRepository.save(u);
            return ResponseEntity.ok(toDto(u));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return userRepository.findById(id).map(u -> {
            userRepository.delete(u);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
        return userRepository.findById(id).map(u -> ResponseEntity.ok(toDto(u))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me/profile")
    public ResponseEntity<ProfileResponse> getMyProfile() {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        Account account = accountRepository.findByUserId(currentUserId).orElse(null);
        long txCount = transactionRepository.countBySenderAccount_User_IdOrReceiverAccount_User_Id(currentUserId, currentUserId);
        long apiKeyCount = apiKeyRepository.countByMerchantProfile_User_Id(currentUserId);

        int recoveryCodesCount = 0;
        if (user.getTwoFactorRecoveryCodes() != null && !user.getTwoFactorRecoveryCodes().isBlank()) {
            recoveryCodesCount = user.getTwoFactorRecoveryCodes().split(",").length;
        }

        ProfileResponse profile = ProfileResponse.builder()
            .user(toDto(user))
            .account(ProfileResponse.from(account))
            .kyc(ProfileResponse.KycSummary.builder()
                .status(account != null && account.getKycStatus() != null ? account.getKycStatus().name() : "NOT_VERIFIED")
                .attempts(user.getKycAttempts())
                .maxAttempts(3)
                .remainingAttempts(Math.max(0, 3 - user.getKycAttempts()))
                .locked(user.isKycLocked())
                .lockedUntil(user.getKycLockedUntil())
                .build())
            .security(ProfileResponse.SecuritySummary.builder()
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .emailVerified(user.isEmailVerified())
                .recoveryCodesRemaining(recoveryCodesCount)
                .lastLoginAt(user.getLastLoginAt())
                .lastLoginIp(user.getLastLoginIp())
                .failedLoginCount(user.getFailedLoginCount())
                .build())
            .stats(ProfileResponse.StatsSummary.builder()
                .transactionsCount(txCount)
                .apiKeysCount(apiKeyCount)
                .memberSince(user.getCreatedAt())
                .build())
            .build();

        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDTO> updateMe(@RequestBody UserRequestDTO body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        boolean sensitiveChange = body.getEmail() != null && !body.getEmail().equalsIgnoreCase(user.getEmail());
        boolean passwordChange = body.getPassword() != null;

        applyUpdates(user, body);

        if (sensitiveChange) {
            user.setEmailVerified(false);
        }

        userRepository.save(user);

        if (sensitiveChange) {
            auditService.log("USER_PROFILE", "PROFILE_EMAIL_CHANGED", AuditEvent.Outcome.SUCCESS,
                "USER", user.getId().toString(),
                "Adresse email modifiée", Map.of("newEmail", body.getEmail()));
        }
        if (passwordChange) {
            auditService.log("USER_PROFILE", "PROFILE_PASSWORD_CHANGED", AuditEvent.Outcome.SUCCESS,
                "USER", user.getId().toString(),
                "Mot de passe modifié", null);
        }

        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping("/me/verify-email")
    public ResponseEntity<UserDTO> verifyEmail() {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        user.setEmailVerified(true);
        userRepository.save(user);
        auditService.log("USER_PROFILE", "PROFILE_EMAIL_VERIFIED", AuditEvent.Outcome.SUCCESS,
            "USER", user.getId().toString(),
            "Email vérifié par l'utilisateur", null);
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me/avatar")
    public ResponseEntity<UserDTO> updateAvatar(@RequestBody Map<String, String> body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        String avatar = body.get("avatarUrl");
        if (avatar != null && avatar.length() > 2_000_000) {
            throw new BusinessException("Avatar trop volumineux (max 2 Mo)", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        user.setAvatarUrl(avatar);
        userRepository.save(user);
        auditService.log("USER_PROFILE", "PROFILE_AVATAR_CHANGED", AuditEvent.Outcome.SUCCESS,
            "USER", user.getId().toString(),
            avatar == null ? "Avatar supprimé" : "Avatar mis à jour", null);
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me/notifications")
    public ResponseEntity<UserDTO> updateNotifications(@RequestBody Map<String, Boolean> body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        if (body.containsKey("email")) user.setNotificationEmail(body.get("email"));
        if (body.containsKey("sms")) user.setNotificationSms(body.get("sms"));
        if (body.containsKey("push")) user.setNotificationPush(body.get("push"));
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<UserDTO> updatePreferences(@RequestBody Map<String, String> body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        if (body.containsKey("language")) user.setPreferredLanguage(body.get("language"));
        if (body.containsKey("timezone")) user.setTimezone(body.get("timezone"));
        userRepository.save(user);
        return ResponseEntity.ok(toDto(user));
    }

    @GetMapping("/me/login-history")
    public ResponseEntity<List<LoginHistoryEntry>> getLoginHistory() {
        UUID currentUserId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(currentUserId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(List.of(
            new LoginHistoryEntry(user.getLastLoginAt(), user.getLastLoginIp(), true)
        ));
    }

    private void applyUpdates(User u, UserRequestDTO body) {
        if (body.getFirstName() != null) u.setFirstName(body.getFirstName());
        if (body.getLastName() != null) u.setLastName(body.getLastName());
        if (body.getEmail() != null) u.setEmail(body.getEmail());
        if (body.getRole() != null) u.setRole(body.getRole());
        if (body.getEnabled() != null) u.setEnabled(body.getEnabled());
        if (body.getPassword() != null) u.setPasswordHash(passwordEncoder.encode(body.getPassword()));
        if (body.getPhoneNumber() != null) u.setPhoneNumber(body.getPhoneNumber());
        if (body.getCin() != null) u.setCin(body.getCin());
        if (body.getDateOfBirth() != null) u.setDateOfBirth(body.getDateOfBirth());
        if (body.getNationality() != null) u.setNationality(body.getNationality());
        if (body.getAvatarUrl() != null) u.setAvatarUrl(body.getAvatarUrl());
        if (body.getPreferredLanguage() != null) u.setPreferredLanguage(body.getPreferredLanguage());
        if (body.getTimezone() != null) u.setTimezone(body.getTimezone());
        if (body.getNotificationEmail() != null) u.setNotificationEmail(body.getNotificationEmail());
        if (body.getNotificationSms() != null) u.setNotificationSms(body.getNotificationSms());
        if (body.getNotificationPush() != null) u.setNotificationPush(body.getNotificationPush());
    }

    private UserDTO toDto(@NonNull User u) {
        int recoveryCodesCount = 0;
        if (u.getTwoFactorRecoveryCodes() != null && !u.getTwoFactorRecoveryCodes().isBlank()) {
            recoveryCodesCount = u.getTwoFactorRecoveryCodes().split(",").length;
        }
        return UserDTO.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phoneNumber(u.getPhoneNumber())
                .cin(u.getCin())
                .dateOfBirth(u.getDateOfBirth())
                .nationality(u.getNationality())
                .role(u.getRole())
                .enabled(u.isEnabled())
                .emailVerified(u.isEmailVerified())
                .twoFactorEnabled(u.isTwoFactorEnabled())
                .avatarUrl(u.getAvatarUrl())
                .preferredLanguage(u.getPreferredLanguage())
                .timezone(u.getTimezone())
                .notificationEmail(u.isNotificationEmail())
                .notificationSms(u.isNotificationSms())
                .notificationPush(u.isNotificationPush())
                .lastLoginAt(u.getLastLoginAt())
                .lastLoginIp(u.getLastLoginIp())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    public record LoginHistoryEntry(Instant loginAt, String ip, boolean success) {}
}
