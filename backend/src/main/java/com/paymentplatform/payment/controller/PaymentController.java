package com.paymentplatform.payment.controller;

import com.paymentplatform.payment.dto.PaymentProvidersResponse;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/providers")
    public ResponseEntity<PaymentProvidersResponse> getPaymentProviders() {
        PaymentProvidersResponse response = PaymentProvidersResponse.builder()
                .cardProviders(com.paymentplatform.payment.enums.PaymentProvider.values())
                .methodTypes(com.paymentplatform.payment.enums.PaymentMethodType.values())
                .build();
        return ResponseEntity.ok(response);
    }
}
