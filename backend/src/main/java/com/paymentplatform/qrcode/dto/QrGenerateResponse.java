package com.paymentplatform.qrcode.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QrGenerateResponse {
    private String qrDataUrl;
    private String paymentReference;
    private String merchantName;
    private String accountNumber;
    private String amount;
    private String currency;
    private String description;
}
