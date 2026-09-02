package com.paymentplatform.reconciliation.controller;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.reconciliation.dto.ImportStatementRequest;
import com.paymentplatform.reconciliation.dto.ReconciliationResponse;
import com.paymentplatform.reconciliation.entity.Reconciliation;
import com.paymentplatform.reconciliation.service.ReconciliationService;
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
@RequestMapping("/api/reconciliation")
@RequiredArgsConstructor
public class ReconciliationController {

    private final ReconciliationService reconciliationService;
    private final CurrentUserService currentUserService;

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'MERCHANT')")
    public ResponseEntity<ReconciliationResponse> importStatement(@Valid @RequestBody ImportStatementRequest request) {
        String performedBy = currentUserService.getCurrentUserEmail();
        ReconciliationService.ReconciliationResult result = reconciliationService.importStatement(
            request.getFileName(), request.getXmlContent(), performedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReconciliationResponse.from(result.reconciliation()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MERCHANT')")
    public ResponseEntity<List<ReconciliationResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Reconciliation> result = (status != null)
            ? reconciliationService.listByStatus(Reconciliation.ReconciliationStatus.valueOf(status), pageable)
            : reconciliationService.listAll(pageable);

        return ResponseEntity.ok(result.stream().map(ReconciliationResponse::from).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MERCHANT')")
    public ResponseEntity<ReconciliationResponse> getById(@PathVariable UUID id) {
        return reconciliationService.getById(id)
            .map(ReconciliationResponse::from)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/entries")
    @PreAuthorize("hasAnyRole('ADMIN', 'MERCHANT')")
    public ResponseEntity<List<ReconciliationResponse.EntryView>> getEntries(@PathVariable UUID id) {
        return ResponseEntity.ok(
            reconciliationService.getEntries(id).stream()
                .map(ReconciliationResponse.EntryView::from)
                .collect(Collectors.toList())
        );
    }
}
