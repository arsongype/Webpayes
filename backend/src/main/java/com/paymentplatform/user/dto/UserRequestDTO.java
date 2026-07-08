package com.paymentplatform.user.dto;

import com.paymentplatform.common.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password; // plaintext for creation
    private Role role;
    private Boolean enabled;
}
