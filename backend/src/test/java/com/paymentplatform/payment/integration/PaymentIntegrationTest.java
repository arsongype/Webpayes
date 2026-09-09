package com.paymentplatform.payment.integration;

import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentMethodType;
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
class PaymentIntegrationTest {

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
    void processPayment_bankTransfer_returnsSuccess() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.BANK_TRANSFER)
                .amount(100.0)
                .currency("MGA")
                .destinationAccount("ACCT-INTEGRATION-1")
                .description("Integration test payment")
                .build();

        ResponseEntity<PaymentResponse> response = restTemplate.postForEntity(
                "/api/payments/process",
                request,
                PaymentResponse.class
        );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
    }

    @Test
    void processPayment_card_returnsResponse() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.CARD)
                .amount(50.0)
                .currency("MGA")
                .build();

        ResponseEntity<PaymentResponse> response = restTemplate.postForEntity(
                "/api/payments/process",
                request,
                PaymentResponse.class
        );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getPaymentProviders_returnsProviders() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "/api/payments/providers",
                String.class
        );

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).contains("STRIPE");
    }
}
