package com.paymentplatform.merchantaffiliation.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.merchantaffiliation.dto.MerchantAffiliationRequestRequestDTO;
import com.paymentplatform.merchantaffiliation.dto.MerchantAffiliationRequestResponseDTO;
import com.paymentplatform.merchantaffiliation.entity.AffiliationRequestStatus;
import com.paymentplatform.merchantaffiliation.entity.MerchantAffiliationRequest;
import com.paymentplatform.merchantaffiliation.repository.MerchantAffiliationRequestRepository;
import com.paymentplatform.security.CurrentUserService;
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
public class MerchantAffiliationRequestService {

    private final MerchantAffiliationRequestRepository affiliationRequestRepository;
    private final CurrentUserService currentUserService;

    public List<MerchantAffiliationRequestResponseDTO> listAll() {
        return affiliationRequestRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<MerchantAffiliationRequestResponseDTO> listByStatus(AffiliationRequestStatus status, Pageable pageable) {
        return affiliationRequestRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public Optional<MerchantAffiliationRequestResponseDTO> getMyRequest() {
        UUID userId = currentUserService.getCurrentUserId();
        return affiliationRequestRepository.findByUserId(userId)
                .map(this::toResponse);
    }

    @Transactional
    public MerchantAffiliationRequestResponseDTO createRequest(MerchantAffiliationRequestRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();

        if (affiliationRequestRepository.existsByUserIdAndStatus(userId, AffiliationRequestStatus.PENDING)) {
            throw new BusinessException("Vous avez déjà une demande en attente", HttpStatus.BAD_REQUEST);
        }

        MerchantAffiliationRequest affiliationRequest = MerchantAffiliationRequest.builder()
                .user(currentUserService.getCurrentUser())
                .reason(request.getReason())
                .status(AffiliationRequestStatus.PENDING)
                .build();

        MerchantAffiliationRequest saved = affiliationRequestRepository.save(affiliationRequest);
        return toResponse(saved);
    }

    @Transactional
    public MerchantAffiliationRequestResponseDTO approve(UUID id) {
        MerchantAffiliationRequest request = affiliationRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Demande introuvable", HttpStatus.NOT_FOUND));
        request.setStatus(AffiliationRequestStatus.APPROVED);
        request.setReviewedBy(currentUserService.getCurrentUser());
        request.setReviewedAt(Instant.now());
        MerchantAffiliationRequest saved = affiliationRequestRepository.save(request);
        return toResponse(saved);
    }

    @Transactional
    public MerchantAffiliationRequestResponseDTO reject(UUID id) {
        MerchantAffiliationRequest request = affiliationRequestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Demande introuvable", HttpStatus.NOT_FOUND));
        request.setStatus(AffiliationRequestStatus.REJECTED);
        request.setReviewedBy(currentUserService.getCurrentUser());
        request.setReviewedAt(Instant.now());
        MerchantAffiliationRequest saved = affiliationRequestRepository.save(request);
        return toResponse(saved);
    }

    private MerchantAffiliationRequestResponseDTO toResponse(MerchantAffiliationRequest request) {
        User user = request.getUser();
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();

        UserDTO reviewedByDTO = null;
        if (request.getReviewedBy() != null) {
            User reviewer = request.getReviewedBy();
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

        return MerchantAffiliationRequestResponseDTO.builder()
                .id(request.getId())
                .user(userDTO)
                .reason(request.getReason())
                .status(request.getStatus())
                .reviewedBy(reviewedByDTO)
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .build();
    }
}
