package com.paymentplatform.merchantaffiliation.dto;

import com.paymentplatform.merchantaffiliation.entity.KycStatus;
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
public class MerchantAffiliationRequestRequestDTO {
    private String reason;
    private String idDocumentImage;
    private String idDocumentType;
    private String idDocumentNumber;
    private String businessRegistrationImage;
}
