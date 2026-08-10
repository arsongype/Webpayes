package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycAccountVerificationResponse {
    private String user_id;
    private String account_number;
    private String status;
    private Boolean verified;
    private Double confidence_score;
    private String rejection_reason;
}
