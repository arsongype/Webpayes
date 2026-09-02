package com.paymentplatform.user.dto;

import com.paymentplatform.common.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
    private Boolean enabled;
    private String phoneNumber;
    private String cin;
    private Instant dateOfBirth;
    private String nationality;
    private String avatarUrl;
    private String preferredLanguage;
    private String timezone;
    private Boolean notificationEmail;
    private Boolean notificationSms;
    private Boolean notificationPush;
}
