package com.paymentplatform.payout.controller;

import com.paymentplatform.payout.dto.PayoutDTOs;
import com.paymentplatform.payout.entity.Payout;
import com.paymentplatform.payout.service.PayoutService;
import com.paymentplatform.security.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;
    private final CurrentUserService currentUserService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutDTOs.PayoutResponse> create(@Valid @RequestBody PayoutDTOs.CreatePayoutRequest request) {
        PayoutDTOs.PayoutResponse response = payoutService.createPayout(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PayoutDTOs.PayoutResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payout> result = currentUserService.isCurrentUserAdmin()
            ? payoutService.listAll(pageable, null)
            : payoutService.listMine(pageable);
        return ResponseEntity.ok(result.stream().map(PayoutDTOs.PayoutResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutDTOs.PayoutSummary> summary() {
        return ResponseEntity.ok(payoutService.summary());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutDTOs.PayoutResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(PayoutDTOs.PayoutResponse.from(payoutService.getById(id)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutDTOs.PayoutResponse> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(PayoutDTOs.PayoutResponse.from(payoutService.cancel(id)));
    }
}
