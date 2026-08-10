package com.paymentplatform.billing.dto;

import com.paymentplatform.user.dto.UserDTO;
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
public class BillingInfoResponseDTO {
    private UUID id;
    private UserDTO user;
    private String fullName;
    private String address;
    private String city;
    private String postalCode;
    private String country;
    private String taxId;
    private Instant createdAt;
    private Instant updatedAt;
}
