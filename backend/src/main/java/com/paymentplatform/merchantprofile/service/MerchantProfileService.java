package com.paymentplatform.merchantprofile.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.merchantprofile.dto.MerchantProfileRequestDTO;
import com.paymentplatform.merchantprofile.dto.MerchantProfileResponseDTO;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.entity.MerchantProfileStatus;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.dto.UserDTO;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MerchantProfileService {

    private final MerchantProfileRepository merchantProfileRepository;
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;

    public List<MerchantProfileResponseDTO> listAll() {
        return merchantProfileRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<MerchantProfileResponseDTO> listByStatus(MerchantProfileStatus status, Pageable pageable) {
        return merchantProfileRepository.findByStatus(status, pageable).map(this::toResponse);
    }

    public List<MerchantProfileResponseDTO> searchPublic(String query) {
        String q = query == null ? "" : query.trim();
        MerchantProfileStatus status = MerchantProfileStatus.APPROVED;
        if (q.isBlank()) {
            return merchantProfileRepository.findByStatus(status, org.springframework.data.domain.PageRequest.of(0, 50)).getContent().stream()
                    .map(this::toResponse).collect(java.util.stream.Collectors.toList());
        }
        return merchantProfileRepository.findByShopNameContainingIgnoreCaseAndStatus(q, status).stream()
                .map(this::toResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public Optional<MerchantProfileResponseDTO> getMyProfile() {
        UUID userId = currentUserService.getCurrentUserId();
        return merchantProfileRepository.findByUserId(userId).map(this::toResponse);
    }

    @Transactional
    public MerchantProfileResponseDTO createOrUpdateMyProfile(MerchantProfileRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        MerchantProfile profile = merchantProfileRepository.findByUserId(userId)
                .orElseGet(() -> MerchantProfile.builder()
                        .user(currentUserService.getCurrentUser())
                        .build());

        if (request.getShopName() != null) profile.setShopName(request.getShopName());
        if (request.getDescription() != null) profile.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) profile.setLogoUrl(request.getLogoUrl());
        if (request.getPhoneNumber() != null) profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getBankAccountNumber() != null) profile.setBankAccountNumber(request.getBankAccountNumber());
        if (request.getBankName() != null) profile.setBankName(request.getBankName());

        MerchantProfile saved = merchantProfileRepository.save(profile);
        return toResponse(saved);
    }

    public MerchantProfileResponseDTO approve(UUID id) {
        MerchantProfile profile = merchantProfileRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Profil marchand introuvable", HttpStatus.NOT_FOUND));
        profile.setStatus(MerchantProfileStatus.APPROVED);
        MerchantProfile saved = merchantProfileRepository.save(profile);
        return toResponse(saved);
    }

    public MerchantProfileResponseDTO reject(UUID id) {
        MerchantProfile profile = merchantProfileRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Profil marchand introuvable", HttpStatus.NOT_FOUND));
        profile.setStatus(MerchantProfileStatus.REJECTED);
        MerchantProfile saved = merchantProfileRepository.save(profile);
        return toResponse(saved);
    }

    private MerchantProfileResponseDTO toResponse(MerchantProfile profile) {
        User user = profile.getUser();
        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();

        return MerchantProfileResponseDTO.builder()
                .id(profile.getId())
                .user(userDTO)
                .shopName(profile.getShopName())
                .description(profile.getDescription())
                .logoUrl(profile.getLogoUrl())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .bankAccountNumber(profile.getBankAccountNumber())
                .bankName(profile.getBankName())
                .status(profile.getStatus())
                .kycStatus(profile.getKycStatus())
                .kycConfidence(profile.getKycConfidence())
                .kycVerifiedAt(profile.getKycVerifiedAt())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
