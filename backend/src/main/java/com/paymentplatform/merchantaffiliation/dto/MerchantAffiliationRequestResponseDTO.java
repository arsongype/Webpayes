package com.paymentplatform.merchantaffiliation.dto;

import com.paymentplatform.merchantaffiliation.entity.AffiliationRequestStatus;
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
public class MerchantAffiliationRequestResponseDTO {
    private UUID id;
    private UserDTO user;
    private String reason;
    private AffiliationRequestStatus status;
    private UserDTO reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt;
}
