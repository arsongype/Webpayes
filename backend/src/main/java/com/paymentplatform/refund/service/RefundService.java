package com.paymentplatform.refund.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.refund.dto.RefundRequestDTO;
import com.paymentplatform.refund.dto.RefundResponseDTO;
import com.paymentplatform.refund.entity.Refund;
import com.paymentplatform.refund.entity.RefundStatus;
import com.paymentplatform.refund.repository.RefundRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRepository refundRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;

    public List<RefundResponseDTO> listMyRefunds() {
        UUID userId = currentUserService.getCurrentUserId();
        return refundRepository.findByRequestedById(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<RefundResponseDTO> listByStatus(RefundStatus status, Pageable pageable) {
        return refundRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Optional<RefundResponseDTO> getRefundByTransactionId(UUID transactionId) {
        return refundRepository.findByTransactionId(transactionId).map(this::toResponse);
    }

    @Transactional
    public RefundResponseDTO requestRefund(RefundRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new BusinessException("Transaction introuvable", HttpStatus.NOT_FOUND));

        if (refundRepository.existsByTransactionIdAndStatus(request.getTransactionId(), RefundStatus.PENDING)) {
            throw new BusinessException("Un remboursement est déjà en cours pour cette transaction", HttpStatus.BAD_REQUEST);
        }

        if (request.getAmount().compareTo(transaction.getAmount()) > 0) {
            throw new BusinessException("Le montant du remboursement ne peut pas dépasser le montant de la transaction", HttpStatus.BAD_REQUEST);
        }

        Refund refund = Refund.builder()
                .transaction(transaction)
                .amount(request.getAmount())
                .reason(request.getReason())
                .status(RefundStatus.PENDING)
                .requestedBy(currentUserService.getCurrentUser())
                .build();

        Refund saved = refundRepository.save(refund);
        return toResponse(saved);
    }

    @Transactional
    public RefundResponseDTO approve(UUID id) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Remboursement introuvable", HttpStatus.NOT_FOUND));
        refund.setStatus(RefundStatus.APPROVED);
        refund.setReviewedBy(currentUserService.getCurrentUser());
        refund.setReviewedAt(Instant.now());
        Refund saved = refundRepository.save(refund);
        return toResponse(saved);
    }

    @Transactional
    public RefundResponseDTO reject(UUID id) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Remboursement introuvable", HttpStatus.NOT_FOUND));
        refund.setStatus(RefundStatus.REJECTED);
        refund.setReviewedBy(currentUserService.getCurrentUser());
        refund.setReviewedAt(Instant.now());
        Refund saved = refundRepository.save(refund);
        return toResponse(saved);
    }

    @Transactional
    public RefundResponseDTO complete(UUID id) {
        Refund refund = refundRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Remboursement introuvable", HttpStatus.NOT_FOUND));
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setReviewedBy(currentUserService.getCurrentUser());
        refund.setReviewedAt(Instant.now());
        Refund saved = refundRepository.save(refund);
        return toResponse(saved);
    }

    private RefundResponseDTO toResponse(Refund refund) {
        User requestedBy = refund.getRequestedBy();
        UserDTO requestedByDTO = UserDTO.builder()
                .id(requestedBy.getId())
                .firstName(requestedBy.getFirstName())
                .lastName(requestedBy.getLastName())
                .email(requestedBy.getEmail())
                .role(requestedBy.getRole())
                .enabled(requestedBy.isEnabled())
                .createdAt(requestedBy.getCreatedAt())
                .build();

        UserDTO reviewedByDTO = null;
        if (refund.getReviewedBy() != null) {
            User reviewer = refund.getReviewedBy();
            reviewedByDTO = UserDTO.builder()
                    .id(reviewer.getId())
                    .firstName(reviewer.getFirstName())
                    .lastName(reviewer.getLastName())
                    .email(reviewer.getEmail())
                    .role(reviewer.getRole())
                    .enabled(reviewer.isEnabled())
                    .createdAt(reviewer.getCreatedAt())
                    .build();
        }

        return RefundResponseDTO.builder()
                .id(refund.getId())
                .transactionId(refund.getTransaction().getId())
                .amount(refund.getAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .requestedBy(requestedByDTO)
                .reviewedBy(reviewedByDTO)
                .reviewedAt(refund.getReviewedAt())
                .createdAt(refund.getCreatedAt())
                .build();
    }
}
