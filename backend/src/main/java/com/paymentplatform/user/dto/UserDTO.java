package com.paymentplatform.user.dto;

import com.paymentplatform.common.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String cin;
    private Instant dateOfBirth;
    private String nationality;
    private Role role;
    private boolean enabled;
    private boolean emailVerified;
    private boolean twoFactorEnabled;
    private String avatarUrl;
    private String preferredLanguage;
    private String timezone;
    private boolean notificationEmail;
    private boolean notificationSms;
    private boolean notificationPush;
    private Instant lastLoginAt;
    private String lastLoginIp;
    private Instant createdAt;
    private Instant updatedAt;
}
