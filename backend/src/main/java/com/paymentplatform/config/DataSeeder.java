package com.paymentplatform.config;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Objects;

@Component
@Profile("!test")
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        final String adminEmail = "admin@localhost";
        final String adminPassword = "Admin123!";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = Objects.requireNonNull(User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email(adminEmail)
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .role(com.paymentplatform.common.constants.Role.ADMIN)
                    .enabled(true)
                    .build());
            admin = userRepository.save(admin);

            Account account = Objects.requireNonNull(Account.builder()
                    .user(admin)
                    .accountNumber("ADMIN-0001")
                    .balance(BigDecimal.ZERO)
                    .currency("MGA")
                    .build());
            accountRepository.save(account);

            System.out.println("Created default admin: email='" + adminEmail + "' password='" + adminPassword + "'");
        } else {
            System.out.println("Admin user already exists: " + adminEmail);
        }
    }
}
