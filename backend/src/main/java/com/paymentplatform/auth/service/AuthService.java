package com.paymentplatform.auth.service;

import com.paymentplatform.auth.dto.AuthResponseDTO;
import com.paymentplatform.auth.dto.LoginRequestDTO;
import com.paymentplatform.auth.dto.RegisterRequestDTO;
import com.paymentplatform.auth.dto.RegisterResponseDTO;
import com.paymentplatform.auth.twofactor.TwoFactorService;
import com.paymentplatform.common.constants.Role;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.security.jwt.JwtTokenProvider;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import com.paymentplatform.account.service.AccountService;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AccountService accountService;
    private final com.paymentplatform.account.repository.AccountRepository accountRepository;
    private final TwoFactorService twoFactorService;
    private final AuditService auditService;

    @Transactional
    public RegisterResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un compte existe déjà avec cet email", HttpStatus.CONFLICT);
        }

        Role role = Role.USER;
        if (request.role() != null) {
            try {
                role = Role.valueOf(request.role().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                role = Role.USER;
            }
        }

        Instant dob = null;
        if (request.dateOfBirth() != null && !request.dateOfBirth().isBlank()) {
            try {
                dob = Instant.parse(request.dateOfBirth());
            } catch (Exception ignored) {
            }
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .enabled(false)
                .phoneNumber(request.phoneNumber())
                .cin(request.cin())
                .dateOfBirth(dob)
                .nationality(request.nationality())
                .build();

        user = userRepository.save(user);
        auditService.log("USER_REGISTRATION", "REGISTER", AuditEvent.Outcome.SUCCESS,
            "USER", user.getId().toString(),
            "Nouveau compte utilisateur créé",
            Map.of("email", user.getEmail(), "role", user.getRole().name()));

        accountService.createAccount(
                new com.paymentplatform.account.dto.AccountRequestDTO(null, null, null, null),
                user.getId(),
                false
        );

        String accountNumber = accountRepository.findByUserId(user.getId())
                .map(com.paymentplatform.account.entity.Account::getAccountNumber)
                .orElse(null);

        return new RegisterResponseDTO(
                "Compte créé avec succès. Veuillez vous connecter.",
                new RegisterResponseDTO.UserSummary(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole().name(),
                        accountNumber
                )
        );
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication;
        try {
            authentication = authenticate(request.email(), request.password());
        } catch (Exception ex) {
            auditService.log("AUTH_LOGIN", "LOGIN", AuditEvent.Outcome.FAILURE,
                "USER", null,
                "Tentative de connexion échouée",
                Map.of("email", request.email().toLowerCase(), "reason", ex.getClass().getSimpleName()));
            throw new BusinessException("Identifiants invalides", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        if (user.isTwoFactorEnabled()) {
            if (request.twoFactorCode() == null || request.twoFactorCode().isBlank()) {
                auditService.log("AUTH_2FA_REQUIRED", "LOGIN_2FA_CHALLENGE", AuditEvent.Outcome.PARTIAL,
                    "USER", user.getId().toString(),
                    "Code 2FA requis pour finaliser la connexion", null);
                return new AuthResponseDTO(
                        null,
                        "Bearer",
                        toUserSummary(user),
                        true,
                        false
                );
            }

            try {
                int code = Integer.parseInt(request.twoFactorCode().trim());
                boolean valid = twoFactorService.verifyCode(user.getTwoFactorSecret(), code);
                if (!valid) {
                    auditService.log("AUTH_2FA", "LOGIN_2FA_FAIL", AuditEvent.Outcome.FAILURE,
                        "USER", user.getId().toString(),
                        "Code 2FA incorrect", null);
                    throw new BusinessException("Code 2FA incorrect. Veuillez réessayer.", HttpStatus.BAD_REQUEST);
                }
                auditService.log("AUTH_2FA", "LOGIN_2FA_SUCCESS", AuditEvent.Outcome.SUCCESS,
                    "USER", user.getId().toString(), "Vérification 2FA réussie", null);
            } catch (NumberFormatException e) {
                throw new BusinessException("Code 2FA invalide. Doit être un nombre à 6 chiffres.", HttpStatus.BAD_REQUEST);
            }
        }

        String token = jwtTokenProvider.generateToken(authentication);
        boolean setupRequired = !user.isTwoFactorEnabled();

        try {
            user.setLastLoginAt(java.time.Instant.now());
            user.setFailedLoginCount(0);
            String ip = null;
            org.springframework.web.context.request.ServletRequestAttributes attrs =
                (org.springframework.web.context.request.ServletRequestAttributes) org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String xff = attrs.getRequest().getHeader("X-Forwarded-For");
                ip = xff != null && !xff.isBlank() ? xff.split(",")[0].trim() : attrs.getRequest().getRemoteAddr();
            }
            user.setLastLoginIp(ip);
            userRepository.save(user);
        } catch (Exception ignored) { }

        auditService.log("AUTH_LOGIN", "LOGIN_SUCCESS", AuditEvent.Outcome.SUCCESS,
            "USER", user.getId().toString(),
            "Connexion réussie", Map.of("role", user.getRole().name()));
        return new AuthResponseDTO(
                token,
                "Bearer",
                toUserSummary(user),
                false,
                setupRequired
        );
    }

    private Authentication authenticate(String email, String password) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email.toLowerCase(), password));
    }

    private AuthResponseDTO.UserSummary toUserSummary(@NonNull User user) {
        String accountNumber = accountRepository.findByUserId(user.getId())
                .map(com.paymentplatform.account.entity.Account::getAccountNumber)
                .orElse(null);
        return new AuthResponseDTO.UserSummary(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                accountNumber,
                user.isTwoFactorEnabled()
        );
    }
}
