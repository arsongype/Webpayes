package com.paymentplatform.vault.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetokenizeResponse {
    private String pan;
    private String panLast4;
    private String cardBrand;
    private String expiryMonth;
    private String expiryYear;
}
