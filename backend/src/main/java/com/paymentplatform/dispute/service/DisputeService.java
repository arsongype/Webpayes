package com.paymentplatform.dispute.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.dispute.dto.DisputeRequestDTO;
import com.paymentplatform.dispute.dto.DisputeResponseDTO;
import com.paymentplatform.dispute.entity.Dispute;
import com.paymentplatform.dispute.entity.DisputeStatus;
import com.paymentplatform.dispute.repository.DisputeRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.transaction.repository.TransactionRepository;
import com.paymentplatform.user.dto.UserDTO;
import com.paymentplatform.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public List<DisputeResponseDTO> listMyDisputes() {
        UUID userId = currentUserService.getCurrentUserId();
        return disputeRepository.findByCreatedById(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<DisputeResponseDTO> listByStatus(DisputeStatus status, Pageable pageable) {
        return disputeRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Optional<DisputeResponseDTO> getDisputeByTransactionId(UUID transactionId) {
        return disputeRepository.findByTransactionId(transactionId).map(this::toResponse);
    }

    @Transactional
    public DisputeResponseDTO createDispute(DisputeRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new BusinessException("Transaction introuvable", HttpStatus.NOT_FOUND));

        List<DisputeStatus> activeStatuses = List.of(DisputeStatus.OPEN, DisputeStatus.IN_PROGRESS);
        if (disputeRepository.existsByTransactionIdAndStatusIn(request.getTransactionId(), activeStatuses)) {
            throw new BusinessException("Un litige est déjà ouvert pour cette transaction", HttpStatus.BAD_REQUEST);
        }

        Dispute dispute = Dispute.builder()
                .transaction(transaction)
                .reason(request.getReason())
                .description(request.getDescription())
                .status(DisputeStatus.OPEN)
                .createdBy(currentUserService.getCurrentUser())
                .build();

        Dispute saved = disputeRepository.save(dispute);
        return toResponse(saved);
    }

    @Transactional
    public DisputeResponseDTO updateStatus(UUID id, DisputeStatus status) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Litige introuvable", HttpStatus.NOT_FOUND));

        dispute.setStatus(status);
        if (status == DisputeStatus.RESOLVED || status == DisputeStatus.CLOSED) {
            dispute.setResolvedBy(currentUserService.getCurrentUser());
            dispute.setResolvedAt(Instant.now());
        }

        Dispute saved = disputeRepository.save(dispute);
        return toResponse(saved);
    }

    @Transactional
    public DisputeResponseDTO resolve(UUID id, String resolution) {
        Dispute dispute = disputeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Litige introuvable", HttpStatus.NOT_FOUND));

        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolution(resolution);
        dispute.setResolvedBy(currentUserService.getCurrentUser());
        dispute.setResolvedAt(Instant.now());

        Dispute saved = disputeRepository.save(dispute);
        return toResponse(saved);
    }

    private DisputeResponseDTO toResponse(Dispute dispute) {
        User createdBy = dispute.getCreatedBy();
        UserDTO createdByDTO = UserDTO.builder()
                .id(createdBy.getId())
                .firstName(createdBy.getFirstName())
                .lastName(createdBy.getLastName())
                .email(createdBy.getEmail())
                .role(createdBy.getRole())
                .enabled(createdBy.isEnabled())
                .createdAt(createdBy.getCreatedAt())
                .build();

        UserDTO resolvedByDTO = null;
        if (dispute.getResolvedBy() != null) {
            User resolver = dispute.getResolvedBy();
            resolvedByDTO = UserDTO.builder()
                    .id(resolver.getId())
                    .firstName(resolver.getFirstName())
                    .lastName(resolver.getLastName())
                    .email(resolver.getEmail())
                    .role(resolver.getRole())
                    .enabled(resolver.isEnabled())
                    .createdAt(resolver.getCreatedAt())
                    .build();
        }

        return DisputeResponseDTO.builder()
                .id(dispute.getId())
                .transactionId(dispute.getTransaction().getId())
                .reason(dispute.getReason())
                .description(dispute.getDescription())
                .status(dispute.getStatus())
                .resolution(dispute.getResolution())
                .createdBy(createdByDTO)
                .resolvedBy(resolvedByDTO)
                .resolvedAt(dispute.getResolvedAt())
                .createdAt(dispute.getCreatedAt())
                .updatedAt(dispute.getUpdatedAt())
                .build();
    }
}
