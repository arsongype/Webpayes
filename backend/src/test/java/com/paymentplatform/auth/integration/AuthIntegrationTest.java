package com.paymentplatform.auth.integration;

import com.paymentplatform.auth.dto.LoginRequestDTO;
import com.paymentplatform.auth.dto.RegisterRequestDTO;
import com.paymentplatform.auth.dto.AuthResponseDTO;
import com.paymentplatform.auth.dto.RegisterResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class AuthIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("paymentplatform_test")
            .withUsername("test")
            .withPassword("test");

    @MockBean
    private StringRedisTemplate redisTemplate;

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void register_returnsCreated() {
        RegisterRequestDTO request = new RegisterRequestDTO(
                "John", "Doe", "john.integration@example.com",
                "+261340000000", "123456789012",
                "2000-01-01", "Malagasy",
                "password123", "password123", null
        );

        ResponseEntity<RegisterResponseDTO> response = restTemplate.postForEntity(
                "/api/auth/register",
                request,
                RegisterResponseDTO.class
        );

        assertThat(response.getStatusCodeValue()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().user().email()).isEqualTo("john.integration@example.com");
    }

    @Test
    void login_returnsOk() {
        RegisterRequestDTO registerRequest = new RegisterRequestDTO(
                "Jane", "Doe", "jane.integration@example.com",
                "+261340000001", "987654321098",
                "1995-05-15", "Malagasy",
                "password456", "password456", null
        );

        restTemplate.postForEntity("/api/auth/register", registerRequest, RegisterResponseDTO.class);

        LoginRequestDTO loginRequest = new LoginRequestDTO("jane.integration@example.com", "password456", null);

        ResponseEntity<AuthResponseDTO> response = restTemplate.postForEntity(
                "/api/auth/login",
                loginRequest,
                AuthResponseDTO.class
        );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotNull();
        assertThat(response.getBody().accessToken()).isNotEmpty();
    }
}
