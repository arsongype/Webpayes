package com.paymentplatform.billing.controller;

import com.paymentplatform.billing.dto.BillingInfoRequestDTO;
import com.paymentplatform.billing.dto.BillingInfoResponseDTO;
import com.paymentplatform.billing.service.BillingInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/billing-infos")
@RequiredArgsConstructor
public class BillingInfoController {

    private final BillingInfoService billingInfoService;

    @GetMapping("/me")
    public ResponseEntity<BillingInfoResponseDTO> getMyBillingInfo() {
        return billingInfoService.getMyBillingInfo()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/me/all")
    public ResponseEntity<List<BillingInfoResponseDTO>> listMyBillingInfos() {
        return ResponseEntity.ok(billingInfoService.listMyBillingInfos());
    }

    @PostMapping("/me")
    public ResponseEntity<BillingInfoResponseDTO> createOrUpdateMyBillingInfo(@RequestBody BillingInfoRequestDTO request) {
        return ResponseEntity.ok(billingInfoService.createOrUpdateMyBillingInfo(request));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMyBillingInfo() {
        billingInfoService.deleteMyBillingInfo();
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<BillingInfoResponseDTO> getById(@PathVariable UUID id) {
        return billingInfoService.getMyBillingInfo()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
