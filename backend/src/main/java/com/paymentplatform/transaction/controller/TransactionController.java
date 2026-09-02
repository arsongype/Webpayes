package com.paymentplatform.transaction.controller;

import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.TransactionStatus;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.dto.TransactionDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserService currentUserService;

    @PostMapping("/transfer")
    public ResponseEntity<TransferResponseDTO> transfer(@Valid @RequestBody TransferRequestDTO request) {
        return ResponseEntity.ok(transactionService.transfer(request));
    }

    @GetMapping
    public ResponseEntity<List<TransactionDTO>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();

        List<Transaction> transactions = transactionService.listTransactions(currentUserId, isAdmin, page, size);
        List<TransactionDTO> dtos = transactions.stream()
            .map(tx -> TransactionDTO.builder()
                .id(tx.getId())
                .senderAccountId(tx.getSenderAccount().getId())
                .receiverAccountId(tx.getReceiverAccount() != null ? tx.getReceiverAccount().getId() : null)
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .status(tx.getStatus())
                .reference(tx.getReference())
                .metadata(tx.getMetadata())
                .fraudScore(tx.getFraudScore())
                .riskScore(tx.getRiskScore())
                .createdAt(tx.getCreatedAt())
                .updatedAt(tx.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TransactionDTO>> search(
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();

        List<Transaction> transactions = transactionService.searchTransactions(currentUserId, isAdmin, reference, status, from, to);
        List<TransactionDTO> dtos = transactions.stream()
            .map(tx -> TransactionDTO.builder()
                .id(tx.getId())
                .senderAccountId(tx.getSenderAccount().getId())
                .receiverAccountId(tx.getReceiverAccount() != null ? tx.getReceiverAccount().getId() : null)
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .status(tx.getStatus())
                .reference(tx.getReference())
                .metadata(tx.getMetadata())
                .fraudScore(tx.getFraudScore())
                .riskScore(tx.getRiskScore())
                .createdAt(tx.getCreatedAt())
                .updatedAt(tx.getUpdatedAt())
                .build())
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionDTO> getById(@PathVariable UUID id) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        Transaction tx = transactionService.getTransaction(id, currentUserId, isAdmin);
        TransactionDTO dto = TransactionDTO.builder()
            .id(tx.getId())
            .senderAccountId(tx.getSenderAccount().getId())
            .receiverAccountId(tx.getReceiverAccount() != null ? tx.getReceiverAccount().getId() : null)
            .amount(tx.getAmount())
            .currency(tx.getCurrency())
            .status(tx.getStatus())
            .reference(tx.getReference())
            .metadata(tx.getMetadata())
            .fraudScore(tx.getFraudScore())
            .riskScore(tx.getRiskScore())
            .createdAt(tx.getCreatedAt())
            .updatedAt(tx.getUpdatedAt())
            .build();
        return ResponseEntity.ok(dto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        long total = transactionService.countTotalTransactions();
        long completed = transactionService.countCompletedTransactions();
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", total);
        stats.put("completed", completed);
        stats.put("pending", total - completed);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/merchant/sales")
    public ResponseEntity<Map<String, Object>> merchantSales(
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        if (from == null) from = Instant.now().minusSeconds(30L * 24 * 60 * 60);
        if (to == null) to = Instant.now();

        BigDecimal total = transactionService.getMerchantSalesTotal(currentUserId, from, to);
        long count = transactionService.getMerchantSalesCount(currentUserId, from, to);
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("total", total);
        result.put("count", count);
        result.put("from", from.toString());
        result.put("to", to.toString());
        return ResponseEntity.ok(result);
    }
}