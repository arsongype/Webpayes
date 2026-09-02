package com.paymentplatform.user.entity;

import com.paymentplatform.common.constants.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @Column(nullable = false)
    @Builder.Default
    private boolean enabled = true;

    @Column(name = "oauth_provider", length = 30)
    private String oauthProvider;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "cin", length = 50)
    private String cin;

    @Column(name = "date_of_birth")
    private Instant dateOfBirth;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "two_factor_enabled", nullable = false)
    @Builder.Default
    private boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret", length = 255)
    private String twoFactorSecret;

    @Column(name = "two_factor_recovery_codes", length = 1000)
    private String twoFactorRecoveryCodes;

    @Column(name = "kyc_attempts", nullable = false)
    @Builder.Default
    private int kycAttempts = 0;

    @Column(name = "kyc_locked", nullable = false)
    @Builder.Default
    private boolean kycLocked = false;

    @Column(name = "kyc_locked_until")
    private Instant kycLockedUntil;

    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "preferred_language", length = 10)
    @Builder.Default
    private String preferredLanguage = "fr";

    @Column(name = "timezone", length = 64)
    @Builder.Default
    private String timezone = "Africa/Nairobi";

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(name = "last_login_ip", length = 64)
    private String lastLoginIp;

    @Column(name = "failed_login_count", nullable = false)
    @Builder.Default
    private int failedLoginCount = 0;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(name = "notification_email", nullable = false)
    @Builder.Default
    private boolean notificationEmail = true;

    @Column(name = "notification_sms", nullable = false)
    @Builder.Default
    private boolean notificationSms = false;

    @Column(name = "notification_push", nullable = false)
    @Builder.Default
    private boolean notificationPush = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
