package com.paymentplatform.merchantprofile.controller;

import com.paymentplatform.merchantprofile.dto.MerchantProfileRequestDTO;
import com.paymentplatform.merchantprofile.dto.MerchantProfileResponseDTO;
import com.paymentplatform.merchantprofile.entity.MerchantProfileStatus;
import com.paymentplatform.merchantprofile.service.MerchantProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/merchant-profiles")
@RequiredArgsConstructor
public class MerchantProfileController {

    private final MerchantProfileService merchantProfileService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<MerchantProfileResponseDTO>> listAll() {
        return ResponseEntity.ok(merchantProfileService.listAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<MerchantProfileResponseDTO>> listByStatus(@PathVariable MerchantProfileStatus status, Pageable pageable) {
        return ResponseEntity.ok(merchantProfileService.listByStatus(status, pageable));
    }

    @GetMapping("/me")
    public ResponseEntity<MerchantProfileResponseDTO> getMyProfile() {
        return merchantProfileService.getMyProfile()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping("/me")
    public ResponseEntity<MerchantProfileResponseDTO> createOrUpdateMyProfile(@RequestBody MerchantProfileRequestDTO request) {
        return ResponseEntity.ok(merchantProfileService.createOrUpdateMyProfile(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<MerchantProfileResponseDTO> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(merchantProfileService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<MerchantProfileResponseDTO> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(merchantProfileService.reject(id));
    }
}
