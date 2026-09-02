package com.paymentplatform.merchantprofile.dto;

import com.paymentplatform.merchantprofile.entity.MerchantProfileStatus;
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
public class MerchantProfileResponseDTO {
    private UUID id;
    private UserDTO user;
    private String shopName;
    private String description;
    private String logoUrl;
    private String phoneNumber;
    private String address;
    private String bankAccountNumber;
    private String bankName;
    private MerchantProfileStatus status;
    private String kycStatus;
    private Double kycConfidence;
    private Instant kycVerifiedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
