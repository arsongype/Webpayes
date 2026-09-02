package com.paymentplatform.wallet.controller;

import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.wallet.dto.WalletBalanceDTO;
import com.paymentplatform.wallet.dto.WalletTransactionDTO;
import com.paymentplatform.wallet.dto.WalletTransactionRequestDTO;
import com.paymentplatform.wallet.service.WalletService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final CurrentUserService currentUserService;

    @GetMapping("/balance")
    public ResponseEntity<WalletBalanceDTO> balance(@RequestParam UUID accountId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        BigDecimal balance = walletService.getBalance(currentUserId, isAdmin, accountId);
        return ResponseEntity.ok(new WalletBalanceDTO(accountId.toString(), balance, "MGA"));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WalletTransactionDTO>> history(@RequestParam UUID accountId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(walletService.listHistory(currentUserId, isAdmin, accountId));
    }

    @PostMapping("/deposit")
    public ResponseEntity<WalletTransactionDTO> deposit(@Valid @RequestBody WalletTransactionRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(walletService.deposit(currentUserId, isAdmin, request.accountId(), request.amount(), request.description()));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletTransactionDTO> withdraw(@Valid @RequestBody WalletTransactionRequestDTO request) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(walletService.withdraw(currentUserId, isAdmin, request.accountId(), request.amount(), request.description()));
    }
}
