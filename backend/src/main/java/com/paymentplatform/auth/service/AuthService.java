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

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException("Un compte existe déjà avec cet email", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .enabled(true)
                .build();

        userRepository.save(user);
        // create default account for new user
        try {
            accountService.createAccount(new com.paymentplatform.account.dto.AccountRequestDTO(null, null, null, null), user.getId(), false);
        } catch (Exception ignored) {
            // account creation is best-effort here; if it fails, continue with auth
        }

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

    private AuthResponseDTO toAuthResponse(String token, User user) {
        return new AuthResponseDTO(
                token,
                "Bearer",
                new AuthResponseDTO.UserSummary(
                        user.getId(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getEmail(),
                        user.getRole().name()
                )
        );
    }
}
