package com.paymentplatform.paymentmethod.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.paymentmethod.dto.PaymentMethodRequestDTO;
import com.paymentplatform.paymentmethod.dto.PaymentMethodResponseDTO;
import com.paymentplatform.paymentmethod.entity.PaymentMethod;
import com.paymentplatform.paymentmethod.entity.PaymentMethodType;
import com.paymentplatform.paymentmethod.repository.PaymentMethodRepository;
import com.paymentplatform.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;
    private final CurrentUserService currentUserService;

    public List<PaymentMethodResponseDTO> listMyPaymentMethods() {
        UUID userId = currentUserService.getCurrentUserId();
        return paymentMethodRepository.findByUserId(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<PaymentMethodResponseDTO> listMyActivePaymentMethods() {
        UUID userId = currentUserService.getCurrentUserId();
        return paymentMethodRepository.findByUserIdAndIsActiveTrue(userId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentMethodResponseDTO createPaymentMethod(PaymentMethodRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();

        PaymentMethod method = PaymentMethod.builder()
                .user(currentUserService.getCurrentUser())
                .type(request.getType() != null ? request.getType() : PaymentMethodType.CARD)
                .provider(request.getProvider())
                .accountNumber(request.getAccountNumber())
                .expiryDate(request.getExpiryDate())
                .isFavorite(request.getIsFavorite() != null ? request.getIsFavorite() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        PaymentMethod saved = paymentMethodRepository.save(method);
        return toResponse(saved);
    }

    @Transactional
    public PaymentMethodResponseDTO updatePaymentMethod(UUID id, PaymentMethodRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Moyen de paiement introuvable", HttpStatus.NOT_FOUND));

        if (!method.getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        if (request.getType() != null) method.setType(request.getType());
        if (request.getProvider() != null) method.setProvider(request.getProvider());
        if (request.getAccountNumber() != null) method.setAccountNumber(request.getAccountNumber());
        if (request.getExpiryDate() != null) method.setExpiryDate(request.getExpiryDate());
        if (request.getIsFavorite() != null) method.setFavorite(request.getIsFavorite());
        if (request.getIsActive() != null) method.setActive(request.getIsActive());

        PaymentMethod saved = paymentMethodRepository.save(method);
        return toResponse(saved);
    }

    @Transactional
    public void deletePaymentMethod(UUID id) {
        UUID userId = currentUserService.getCurrentUserId();
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Moyen de paiement introuvable", HttpStatus.NOT_FOUND));

        if (!method.getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        paymentMethodRepository.delete(method);
    }

    @Transactional
    public PaymentMethodResponseDTO toggleFavorite(UUID id) {
        UUID userId = currentUserService.getCurrentUserId();
        PaymentMethod method = paymentMethodRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Moyen de paiement introuvable", HttpStatus.NOT_FOUND));

        if (!method.getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        method.setFavorite(!method.isFavorite());
        PaymentMethod saved = paymentMethodRepository.save(method);
        return toResponse(saved);
    }

    private PaymentMethodResponseDTO toResponse(PaymentMethod method) {
        return PaymentMethodResponseDTO.builder()
                .id(method.getId())
                .userId(method.getUser().getId())
                .type(method.getType())
                .provider(method.getProvider())
                .accountNumber(method.getAccountNumber())
                .expiryDate(method.getExpiryDate())
                .isFavorite(method.isFavorite())
                .isActive(method.isActive())
                .createdAt(method.getCreatedAt())
                .build();
    }
}
