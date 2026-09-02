package com.paymentplatform.kyc.service;

import com.paymentplatform.aiclient.KycClient;
import com.paymentplatform.aiclient.KycVerificationRequest;
import com.paymentplatform.aiclient.KycVerificationResponse;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.entity.AccountKycStatus;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.kyc.KycDocumentController.KycDocumentRequest;
import com.paymentplatform.kyc.KycDocumentController.KycStatusResponse;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycClient kycClient;
    private final MerchantProfileRepository merchantProfileRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CurrentUserService currentUserService;
    private final AuditService auditService;

    private static final int MAX_KYC_ATTEMPTS = 3;
    private static final long LOCK_DURATION_HOURS = 24;

    @Transactional
    public KycVerificationResponse verify(KycDocumentRequest request) {
        UUID userId = currentUserService.getCurrentUserId();
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (user.isKycLocked()) {
            if (user.getKycLockedUntil() != null && Instant.now().isAfter(user.getKycLockedUntil())) {
                user.setKycLocked(false);
                user.setKycAttempts(0);
                user.setKycLockedUntil(null);
                userRepository.save(user);
            } else {
                throw new BusinessException(
                    "Vérification KYC verrouillée. Nombre maximum de tentatives atteint. Réessayez après le " +
                    (user.getKycLockedUntil() != null ? user.getKycLockedUntil() : "déverrouillage."),
                    HttpStatus.FORBIDDEN);
            }
        }

        MerchantProfile profile = merchantProfileRepository.findByUserId(userId).orElse(null);
        Account account = accountRepository.findByUserId(userId).orElse(null);

        if (profile == null && account == null) {
            throw new BusinessException("Aucun profil ou compte trouvé. Créez d'abord un compte.", HttpStatus.BAD_REQUEST);
        }

        KycVerificationRequest kycRequest = KycVerificationRequest.builder()
            .user_id(userId.toString())
            .id_document_image(request.getDocumentImage())
            .full_name(request.getFullName())
            .date_of_birth(request.getDateOfBirth())
            .nationality(request.getNationality())
            .build();

        KycVerificationResponse response = kycClient.verify(kycRequest);

        if (response == null) {
            auditService.log("KYC", "KYC_VERIFY", AuditEvent.Outcome.FAILURE,
                "USER", userId.toString(),
                "Service KYC indisponible", null);
            throw new BusinessException("Le service de vérification KYC est indisponible.", HttpStatus.SERVICE_UNAVAILABLE);
        }

        if ("VERIFIED".equals(response.getStatus())) {
            if (profile != null) {
                profile.setKycStatus("VERIFIED");
                profile.setKycConfidence(response.getConfidence_score());
                profile.setKycVerifiedAt(Instant.now());
                merchantProfileRepository.save(profile);
            }
            if (account != null) {
                account.setKycStatus(AccountKycStatus.VERIFIED);
                accountRepository.save(account);
            }

            user.setKycAttempts(0);
            user.setKycLocked(false);
            user.setKycLockedUntil(null);
            userRepository.save(user);

            auditService.log("KYC", "KYC_VERIFIED", AuditEvent.Outcome.SUCCESS,
                "USER", userId.toString(),
                "KYC vérifié avec succès",
                Map.of("confidence", String.valueOf(response.getConfidence_score()),
                       "nationality", request.getNationality() != null ? request.getNationality() : "n/a"));
        } else {
            int attempts = user.getKycAttempts() + 1;
            user.setKycAttempts(attempts);

            if (attempts >= MAX_KYC_ATTEMPTS) {
                user.setKycLocked(true);
                user.setKycLockedUntil(Instant.now().plus(LOCK_DURATION_HOURS, ChronoUnit.HOURS));
            }
            userRepository.save(user);

            if (profile != null) {
                profile.setKycStatus("REJECTED");
                profile.setKycConfidence(response.getConfidence_score());
                merchantProfileRepository.save(profile);
            }
            if (account != null) {
                account.setKycStatus(AccountKycStatus.REJECTED);
                accountRepository.save(account);
            }

            auditService.log("KYC", "KYC_REJECTED", AuditEvent.Outcome.FAILURE,
                "USER", userId.toString(),
                "KYC rejeté",
                Map.of("attempts", String.valueOf(attempts),
                       "confidence", String.valueOf(response.getConfidence_score()),
                       "reason", response.getRejection_reason() != null ? response.getRejection_reason() : "n/a",
                       "locked", String.valueOf(user.isKycLocked())));

            if (user.isKycLocked()) {
                throw new BusinessException(
                    "KYC rejetée. Vous avez atteint le nombre maximum de tentatives (" + MAX_KYC_ATTEMPTS + "). " +
                    "Réessayez après le " + user.getKycLockedUntil() + ".",
                    HttpStatus.FORBIDDEN);
            }
        }

        return response;
    }

    public KycStatusResponse getStatus() {
        UUID userId = currentUserService.getCurrentUserId();
        MerchantProfile profile = merchantProfileRepository.findByUserId(userId).orElse(null);
        Account account = accountRepository.findByUserId(userId).orElse(null);
        User user = userRepository.findById(userId).orElse(null);

        String status;
        Double confidence = null;
        Instant verifiedAt = null;

        if (account != null && account.getKycStatus() != null) {
            status = account.getKycStatus().name();
        } else if (profile != null && profile.getKycStatus() != null) {
            status = profile.getKycStatus();
            confidence = profile.getKycConfidence();
            verifiedAt = profile.getKycVerifiedAt();
        } else {
            status = "NOT_STARTED";
        }

        int attempts = user != null ? user.getKycAttempts() : 0;
        boolean locked = user != null && user.isKycLocked();
        Instant lockedUntil = user != null ? user.getKycLockedUntil() : null;
        int remaining = Math.max(0, MAX_KYC_ATTEMPTS - attempts);

        return new KycStatusResponse(
            status, confidence, verifiedAt,
            MAX_KYC_ATTEMPTS, remaining, locked, lockedUntil
        );
    }
}
