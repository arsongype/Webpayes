package com.paymentplatform.billing.dto;

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
public class BillingInfoRequestDTO {
    private String fullName;
    private String address;
    private String city;
    private String postalCode;
    private String country;
    private String taxId;
}
