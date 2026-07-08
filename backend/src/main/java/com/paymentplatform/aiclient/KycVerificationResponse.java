package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycVerificationResponse {
    private String verification_id;
    private String user_id;
    private String status;
    private Map<String, Object> extracted_data;
    private Double confidence_score;
    private String rejection_reason;
    private String created_at;
    private String updated_at;
}
