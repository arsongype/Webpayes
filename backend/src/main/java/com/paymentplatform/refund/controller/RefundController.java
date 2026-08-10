package com.paymentplatform.refund.controller;

import com.paymentplatform.refund.dto.RefundRequestDTO;
import com.paymentplatform.refund.dto.RefundResponseDTO;
import com.paymentplatform.refund.entity.RefundStatus;
import com.paymentplatform.refund.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @GetMapping
    public ResponseEntity<List<RefundResponseDTO>> listMyRefunds() {
        return ResponseEntity.ok(refundService.listMyRefunds());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<RefundResponseDTO>> listByStatus(@PathVariable RefundStatus status, Pageable pageable) {
        return ResponseEntity.ok(refundService.listByStatus(status, pageable));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<RefundResponseDTO> getByTransactionId(@PathVariable UUID transactionId) {
        return refundService.getRefundByTransactionId(transactionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<RefundResponseDTO> requestRefund(@RequestBody RefundRequestDTO request) {
        return ResponseEntity.ok(refundService.requestRefund(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<RefundResponseDTO> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(refundService.approve(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<RefundResponseDTO> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(refundService.reject(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/complete")
    public ResponseEntity<RefundResponseDTO> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(refundService.complete(id));
    }
}
