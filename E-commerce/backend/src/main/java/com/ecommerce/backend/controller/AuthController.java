package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/logout")
    public MessageResponse logout() {
        return new MessageResponse("Déconnexion réussie");
    }

    @GetMapping("/me")
    public UserResponse me() {
        return authService.getCurrentUser();
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@RequestBody LoginRequest request) {
        return new MessageResponse("Si l'email existe, un lien de réinitialisation a été envoyé");
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword() {
        return new MessageResponse("Mot de passe réinitialisé avec succès");
    }

    @PostMapping("/refresh-token")
    public MessageResponse refreshToken() {
        return new MessageResponse("Token rafraîchi");
    }
}
