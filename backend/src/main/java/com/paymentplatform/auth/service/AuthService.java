package com.paymentplatform.auth.service;

import com.paymentplatform.auth.dto.AuthResponseDTO;
import com.paymentplatform.auth.dto.LoginRequestDTO;
import com.paymentplatform.auth.dto.RegisterRequestDTO;
import com.paymentplatform.common.constants.Role;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.security.jwt.JwtTokenProvider;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import com.paymentplatform.account.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AccountService accountService;
    private final com.paymentplatform.account.repository.AccountRepository accountRepository;

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
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

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(role)
                .enabled(true)
                .build();

        user = userRepository.save(user);

        // Every registered user must own an account so they can pay, deposit,
        // withdraw and transact. Account creation is part of registration and
        // failures must not be silently ignored.
        accountService.createAccount(
                new com.paymentplatform.account.dto.AccountRequestDTO(null, null, null, null),
                user.getId(),
                false
        );

        Authentication authentication = authenticate(request.email(), request.password());
        String token = jwtTokenProvider.generateToken(authentication);

        return toAuthResponse(token, user);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticate(request.email(), request.password());

        User user = userRepository.findByEmail(request.email().toLowerCase())
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.NOT_FOUND));

        String token = jwtTokenProvider.generateToken(authentication);

        return toAuthResponse(token, user);
    }

    private Authentication authenticate(String email, String password) {
        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email.toLowerCase(), password));
    }

    private AuthResponseDTO toAuthResponse(String token, @NonNull User user) {
        String accountNumber = accountRepository.findByUserId(user.getId())
                .map(com.paymentplatform.account.entity.Account::getAccountNumber)
                .orElse(null);
        return new AuthResponseDTO(
                token,
                "Bearer",
                new AuthResponseDTO.UserSummary(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole().name(),
                        accountNumber
                )
        );
    }
}
