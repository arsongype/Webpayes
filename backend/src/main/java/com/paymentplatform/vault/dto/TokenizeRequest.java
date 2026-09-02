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
public class TokenizeRequest {
    private String pan;
    private String expiryMonth;
    private String expiryYear;
    private String cardHolderName;
}
