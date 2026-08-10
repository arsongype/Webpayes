package com.paymentplatform.billing.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.billing.dto.BillingInfoRequestDTO;
import com.paymentplatform.billing.dto.BillingInfoResponseDTO;
import com.paymentplatform.billing.entity.BillingInfo;
import com.paymentplatform.billing.repository.BillingInfoRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingInfoService {

    private final BillingInfoRepository billingInfoRepository;
    private final CurrentUserService currentUserService;

    public List<BillingInfoResponseDTO> listMyBillingInfos() {
        UUID userId = currentUserService.getCurrentUserId();
        return billingInfoRepository.findByUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Optional<BillingInfoResponseDTO> getMyBillingInfo() {
        UUID userId = currentUserService.getCurrentUserId();
        return billingInfoRepository.findByUserId(userId).map(this::toResponse);
    }

    @Transactional
    public BillingInfoResponseDTO createOrUpdateMyBillingInfo(BillingInfoRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        BillingInfo billingInfo = billingInfoRepository.findByUserId(userId)
                .orElseGet(() -> BillingInfo.builder()
                        .user(currentUserService.getCurrentUser())
                        .build());

        if (request.getFullName() != null) billingInfo.setFullName(request.getFullName());
        if (request.getAddress() != null) billingInfo.setAddress(request.getAddress());
        if (request.getCity() != null) billingInfo.setCity(request.getCity());
        if (request.getPostalCode() != null) billingInfo.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) billingInfo.setCountry(request.getCountry());
        if (request.getTaxId() != null) billingInfo.setTaxId(request.getTaxId());

        BillingInfo saved = billingInfoRepository.save(billingInfo);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMyBillingInfo() {
        UUID userId = currentUserService.getCurrentUserId();
        billingInfoRepository.findByUserId(userId).ifPresent(billingInfoRepository::delete);
    }

    private BillingInfoResponseDTO toResponse(BillingInfo billingInfo) {
        UserDTO userDTO = UserDTO.builder()
                .id(billingInfo.getUser().getId())
                .firstName(billingInfo.getUser().getFirstName())
                .lastName(billingInfo.getUser().getLastName())
                .email(billingInfo.getUser().getEmail())
                .role(billingInfo.getUser().getRole())
                .enabled(billingInfo.getUser().isEnabled())
                .createdAt(billingInfo.getUser().getCreatedAt())
                .build();

        return BillingInfoResponseDTO.builder()
                .id(billingInfo.getId())
                .user(userDTO)
                .fullName(billingInfo.getFullName())
                .address(billingInfo.getAddress())
                .city(billingInfo.getCity())
                .postalCode(billingInfo.getPostalCode())
                .country(billingInfo.getCountry())
                .taxId(billingInfo.getTaxId())
                .createdAt(billingInfo.getCreatedAt())
                .updatedAt(billingInfo.getUpdatedAt())
                .build();
    }
}
