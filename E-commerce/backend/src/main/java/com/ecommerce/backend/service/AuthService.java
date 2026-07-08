package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.enums.Role;
import com.ecommerce.backend.exception.ApiException;
import com.ecommerce.backend.mapper.EntityMapper;
import com.ecommerce.backend.repository.UserRepository;
import com.ecommerce.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EntityMapper mapper;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException("Utilisateur non trouvé", 404));

        String token = jwtService.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponse(token, token, mapper.toUserResponse(user));
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException("Cet email est déjà utilisé", 409);
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .role(Role.USER)
                .build();

        return mapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse getCurrentUser() {
        return mapper.toUserResponse(getAuthenticatedUser());
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User user = getAuthenticatedUser();
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        return mapper.toUserResponse(userRepository.save(user));
    }

    public User getAuthenticatedUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ApiException("Utilisateur non trouvé", 404));
    }
}
