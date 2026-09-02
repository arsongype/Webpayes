package com.paymentplatform.security;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public UUID getCurrentUserId() {
        User user = getCurrentUser();
        return user.getId();
    }

    public boolean isCurrentUserAdmin() {
        Authentication authentication = getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }

    public User getCurrentUser() {
        Authentication authentication = getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new BusinessException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        String email = userDetails.getUsername();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Utilisateur introuvable", HttpStatus.UNAUTHORIZED));
    }

    public String getCurrentUserEmail() {
        Authentication authentication = getAuthentication();
        Object principal = authentication.getPrincipal();
        if (!(principal instanceof UserDetails userDetails)) {
            throw new BusinessException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        return userDetails.getUsername();
    }

    private Authentication getAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        return authentication;
    }
}
