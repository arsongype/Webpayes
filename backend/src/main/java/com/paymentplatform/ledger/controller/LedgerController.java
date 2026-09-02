package com.paymentplatform.ledger.controller;

import com.paymentplatform.ledger.dto.LedgerDTO;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;
    private final CurrentUserService currentUserService;

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<List<LedgerDTO>> getByTransactionId(@PathVariable UUID transactionId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(ledgerService.getByTransactionId(transactionId));
    }
}
