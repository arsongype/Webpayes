package com.paymentplatform.dispute.controller;

import com.paymentplatform.dispute.dto.DisputeRequestDTO;
import com.paymentplatform.dispute.dto.DisputeResponseDTO;
import com.paymentplatform.dispute.entity.DisputeStatus;
import com.paymentplatform.dispute.service.DisputeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/disputes")
@RequiredArgsConstructor
public class DisputeController {

    private final DisputeService disputeService;

    @GetMapping
    public ResponseEntity<List<DisputeResponseDTO>> listMyDisputes() {
        return ResponseEntity.ok(disputeService.listMyDisputes());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<DisputeResponseDTO>> listByStatus(@PathVariable DisputeStatus status, Pageable pageable) {
        return ResponseEntity.ok(disputeService.listByStatus(status, pageable));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<DisputeResponseDTO> getByTransactionId(@PathVariable UUID transactionId) {
        return disputeService.getDisputeByTransactionId(transactionId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PostMapping
    public ResponseEntity<DisputeResponseDTO> createDispute(@RequestBody DisputeRequestDTO request) {
        return ResponseEntity.ok(disputeService.createDispute(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/status")
    public ResponseEntity<DisputeResponseDTO> updateStatus(@PathVariable UUID id, @RequestBody java.util.Map<String, String> body) {
        DisputeStatus status = DisputeStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(disputeService.updateStatus(id, status));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/resolve")
    public ResponseEntity<DisputeResponseDTO> resolve(@PathVariable UUID id, @RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(disputeService.resolve(id, body.get("resolution")));
    }
}
