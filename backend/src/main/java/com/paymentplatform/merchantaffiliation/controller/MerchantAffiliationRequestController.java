package com.paymentplatform.merchantaffiliation.controller;

import com.paymentplatform.merchantaffiliation.dto.MerchantAffiliationRequestRequestDTO;
import com.paymentplatform.merchantaffiliation.dto.MerchantAffiliationRequestResponseDTO;
import com.paymentplatform.merchantaffiliation.entity.AffiliationRequestStatus;
import com.paymentplatform.merchantaffiliation.service.MerchantAffiliationRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/merchant-affiliation-requests")
@RequiredArgsConstructor
public class MerchantAffiliationRequestController {

    private final MerchantAffiliationRequestService affiliationRequestService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MerchantAffiliationRequestResponseDTO>> listAll() {
        return ResponseEntity.ok(affiliationRequestService.listAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<MerchantAffiliationRequestResponseDTO>> listByStatus(@PathVariable AffiliationRequestStatus status, Pageable pageable) {
        return ResponseEntity.ok(affiliationRequestService.listByStatus(status, pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<MerchantAffiliationRequestResponseDTO> getMyRequest() {
        return affiliationRequestService.getMyRequest()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<MerchantAffiliationRequestResponseDTO> createRequest(@RequestBody MerchantAffiliationRequestRequestDTO request) {
        return ResponseEntity.ok(affiliationRequestService.createRequest(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<MerchantAffiliationRequestResponseDTO> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(affiliationRequestService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<MerchantAffiliationRequestResponseDTO> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(affiliationRequestService.reject(id));
    }
}
