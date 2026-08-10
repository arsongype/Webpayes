package com.paymentplatform.aiclient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycAccountVerificationRequest {
    private String user_id;
    private String account_number;
    private String full_name;
    private String date_of_birth;
    private String nationality;
    private String id_document_image;
}
