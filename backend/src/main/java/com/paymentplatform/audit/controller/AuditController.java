package com.paymentplatform.audit.controller;

import com.paymentplatform.audit.dto.AuditDTOs;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditDTOs.AuditEventView>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        Page<AuditEvent> result = auditService.findAll(pageable);
        return ResponseEntity.ok(result.stream().map(AuditDTOs.AuditEventView::from).collect(Collectors.toList()));
    }

    @GetMapping("/actor/{actorId}")
    public ResponseEntity<List<AuditDTOs.AuditEventView>> byActor(
            @PathVariable UUID actorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        Page<AuditEvent> result = auditService.findByActor(actorId, pageable);
        return ResponseEntity.ok(result.stream().map(AuditDTOs.AuditEventView::from).collect(Collectors.toList()));
    }

    @GetMapping("/type/{eventType}")
    public ResponseEntity<List<AuditDTOs.AuditEventView>> byType(
            @PathVariable String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        Page<AuditEvent> result = auditService.findByEventType(eventType, pageable);
        return ResponseEntity.ok(result.stream().map(AuditDTOs.AuditEventView::from).collect(Collectors.toList()));
    }

    @GetMapping("/period")
    public ResponseEntity<List<AuditDTOs.AuditEventView>> byPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        Page<AuditEvent> result = auditService.findByPeriod(from, to, pageable);
        return ResponseEntity.ok(result.stream().map(AuditDTOs.AuditEventView::from).collect(Collectors.toList()));
    }

    @GetMapping("/integrity")
    public ResponseEntity<AuditDTOs.IntegrityCheckResult> verifyIntegrity(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 1000));
        Page<AuditEvent> result = auditService.findAll(pageable);
        boolean valid = auditService.verifyHashChain(result.getContent());
        return ResponseEntity.ok(AuditDTOs.IntegrityCheckResult.builder()
            .valid(valid)
            .eventsChecked(result.getNumberOfElements())
            .message(valid ? "Intégrité de la chaîne d'audit vérifiée" : "Chaîne d'audit compromise")
            .build());
    }
}
