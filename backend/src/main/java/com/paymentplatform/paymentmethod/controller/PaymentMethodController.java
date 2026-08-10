package com.paymentplatform.paymentmethod.controller;

import com.paymentplatform.paymentmethod.dto.PaymentMethodCategoryRequestDTO;
import com.paymentplatform.paymentmethod.dto.PaymentMethodCategoryResponseDTO;
import com.paymentplatform.paymentmethod.dto.PaymentMethodRequestDTO;
import com.paymentplatform.paymentmethod.dto.PaymentMethodResponseDTO;
import com.paymentplatform.paymentmethod.service.PaymentMethodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-methods")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    @GetMapping
    public ResponseEntity<List<PaymentMethodResponseDTO>> listMyPaymentMethods() {
        return ResponseEntity.ok(paymentMethodService.listMyPaymentMethods());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PaymentMethodResponseDTO>> listMyActivePaymentMethods() {
        return ResponseEntity.ok(paymentMethodService.listMyActivePaymentMethods());
    }

    @PostMapping
    public ResponseEntity<PaymentMethodResponseDTO> createPaymentMethod(@RequestBody PaymentMethodRequestDTO request) {
        return ResponseEntity.ok(paymentMethodService.createPaymentMethod(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PaymentMethodResponseDTO> updatePaymentMethod(@PathVariable UUID id, @RequestBody PaymentMethodRequestDTO request) {
        return ResponseEntity.ok(paymentMethodService.updatePaymentMethod(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaymentMethod(@PathVariable UUID id) {
        paymentMethodService.deletePaymentMethod(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/favorite")
    public ResponseEntity<PaymentMethodResponseDTO> toggleFavorite(@PathVariable UUID id) {
        return ResponseEntity.ok(paymentMethodService.toggleFavorite(id));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<PaymentMethodCategoryResponseDTO>> listCategories() {
        return ResponseEntity.ok(paymentMethodService.listCategories());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/categories")
    public ResponseEntity<PaymentMethodCategoryResponseDTO> createCategory(@RequestBody PaymentMethodCategoryRequestDTO request) {
        return ResponseEntity.ok(paymentMethodService.createCategory(request));
    }
}
