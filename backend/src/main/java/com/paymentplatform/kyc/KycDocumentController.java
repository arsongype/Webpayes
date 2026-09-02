package com.paymentplatform.kyc;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.paymentplatform.aiclient.KycVerificationResponse;
import com.paymentplatform.kyc.service.KycService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycDocumentController {

    private final KycService kycService;

    @PostMapping("/verify")
    public ResponseEntity<KycVerificationResponse> verifyKyc(@RequestBody KycDocumentRequest request) {
        return ResponseEntity.ok(kycService.verify(request));
    }

    @GetMapping("/status")
    public ResponseEntity<KycStatusResponse> getStatus() {
        return ResponseEntity.ok(kycService.getStatus());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KycDocumentRequest {
        private String documentImage;
        private String fullName;
        private String dateOfBirth;
        private String nationality;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class KycStatusResponse {
        private String status;
        private Double confidence;
        private Instant verifiedAt;
        private int maxAttempts;
        private int remainingAttempts;
        private boolean locked;
        private Instant lockedUntil;
    }
}
