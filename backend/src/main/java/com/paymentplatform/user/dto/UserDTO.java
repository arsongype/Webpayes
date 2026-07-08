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
    private Role role;
    private boolean enabled;
    private Instant createdAt;
}
