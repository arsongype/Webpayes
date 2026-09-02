package com.paymentplatform.merchantaffiliation.dto;

import com.paymentplatform.merchantaffiliation.entity.AffiliationRequestStatus;
import com.paymentplatform.merchantaffiliation.entity.KycStatus;
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
    private UUID userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String reason;
    private AffiliationRequestStatus status;
    private UserDTO reviewedBy;
    private Instant reviewedAt;
    private Instant createdAt;

    private String idDocumentType;
    private String idDocumentNumber;
    private String idDocumentImage;
    private String businessRegistrationImage;
    private KycStatus kycStatus;
    private Instant kycSubmittedAt;
}
