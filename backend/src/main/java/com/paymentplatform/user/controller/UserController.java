package com.paymentplatform.user.controller;

import com.paymentplatform.user.dto.UserDTO;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> list() {
        List<UserDTO> dtos = userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<UserDTO> create(@RequestBody com.paymentplatform.user.dto.UserRequestDTO body) {
        if (userRepository.existsByEmail(body.getEmail())) {
            return ResponseEntity.badRequest().build();
        }
        com.paymentplatform.user.entity.User u = com.paymentplatform.user.entity.User.builder()
                .firstName(body.getFirstName())
                .lastName(body.getLastName())
                .email(body.getEmail())
            .passwordHash(passwordEncoder.encode(body.getPassword()))
                .role(body.getRole() == null ? com.paymentplatform.common.constants.Role.USER : body.getRole())
                .enabled(body.getEnabled() == null ? true : body.getEnabled())
                .build();
        userRepository.save(u);
        return ResponseEntity.ok(toDto(u));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable UUID id, @RequestBody com.paymentplatform.user.dto.UserRequestDTO body) {
        return userRepository.findById(id).map(u -> {
            if (body.getFirstName() != null) u.setFirstName(body.getFirstName());
            if (body.getLastName() != null) u.setLastName(body.getLastName());
            if (body.getEmail() != null) u.setEmail(body.getEmail());
            if (body.getRole() != null) u.setRole(body.getRole());
            if (body.getEnabled() != null) u.setEnabled(body.getEnabled());
            if (body.getPassword() != null) u.setPasswordHash(passwordEncoder.encode(body.getPassword()));
            userRepository.save(u);
            return ResponseEntity.ok(toDto(u));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return userRepository.findById(id).map(u -> {
            userRepository.delete(u);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable UUID id) {
        return userRepository.findById(id).map(u -> ResponseEntity.ok(toDto(u))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private UserDTO toDto(User u) {
        return UserDTO.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .role(u.getRole())
                .enabled(u.isEnabled())
                .createdAt(u.getCreatedAt())
                .build();
    }
}
