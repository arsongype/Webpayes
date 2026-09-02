package com.paymentplatform.aiclient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExemptionResponse {
    private String transactionId;
    private boolean exemptionGranted;
    private String reason;
    private String exemptionType;
}
