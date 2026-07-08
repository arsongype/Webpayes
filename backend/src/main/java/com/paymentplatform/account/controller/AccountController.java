package com.paymentplatform.account.controller;

import com.paymentplatform.account.dto.AccountDTO;
import com.paymentplatform.account.dto.AccountRequestDTO;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.service.AccountService;
import com.paymentplatform.security.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<AccountDTO>> list(@RequestParam(required = false) UUID userId) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(accountService.listAccounts(currentUserId, isAdmin, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountDTO> getById(@PathVariable UUID id) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(accountService.getAccount(id, currentUserId, isAdmin));
    }

    @PostMapping
    public ResponseEntity<AccountDTO> create(@Valid @RequestBody com.paymentplatform.account.dto.AccountRequestDTO body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(accountService.createAccount(body, currentUserId, isAdmin));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountDTO> update(@PathVariable UUID id, @RequestBody com.paymentplatform.account.dto.AccountRequestDTO body) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        return ResponseEntity.ok(accountService.updateAccount(id, body, currentUserId, isAdmin));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UUID currentUserId = currentUserService.getCurrentUserId();
        boolean isAdmin = currentUserService.isCurrentUserAdmin();
        accountService.deleteAccount(id, currentUserId, isAdmin);
        return ResponseEntity.noContent().build();
    }

    private AccountDTO toDto(Account a) {
        return AccountDTO.builder()
                .id(a.getId())
                .userId(a.getUser() != null ? a.getUser().getId() : null)
                .accountNumber(a.getAccountNumber())
                .balance(a.getBalance())
                .currency(a.getCurrency())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
