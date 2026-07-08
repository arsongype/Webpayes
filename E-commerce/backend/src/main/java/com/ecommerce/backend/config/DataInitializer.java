package com.ecommerce.backend.config;

import com.ecommerce.backend.enums.Role;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedUser("demo@shopease.fr", "Demo123!", "Jean", "Dupont", Role.USER, LocalDateTime.of(2024, 1, 15, 10, 0));
        seedUser("admin@shopease.fr", "Admin123!", "Admin", "ShopEase", Role.ADMIN,
                LocalDateTime.of(2024, 1, 1, 10, 0));
    }

    private void seedUser(String email, String password, String firstName, String lastName, Role role,
            LocalDateTime createdAt) {
        if (userRepository.findByEmail(email).isEmpty()) {
            userRepository.save(User.builder()
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .createdAt(createdAt)
                    .build());
        }
    }
}
