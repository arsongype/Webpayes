package com.paymentplatform.idempotency;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private IdempotencyService idempotencyService;

    @BeforeEach
    void setUp() {
        idempotencyService = new IdempotencyService(redisTemplate);
    }

    @Test
    void checkAndStore_newKey_returnsTrue() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);

        boolean result = idempotencyService.checkAndStore("key-123", "response-body");

        assertTrue(result);
    }

    @Test
    void checkAndStore_duplicateKey_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);

        boolean result = idempotencyService.checkAndStore("key-123", "response-body");

        assertFalse(result);
    }

    @Test
    void checkAndStore_nullKey_returnsFalse() {
        assertFalse(idempotencyService.checkAndStore(null, "response-body"));
        assertFalse(idempotencyService.checkAndStore("", "response-body"));
        assertFalse(idempotencyService.checkAndStore("   ", "response-body"));
    }

    @Test
    void getResponse_existingKey_returnsResponse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("idempotency:key-123")).thenReturn("{\"status\":\"COMPLETED\",\"response\":\"cached-response\"}");

        Optional<String> result = idempotencyService.getResponse("key-123");

        assertTrue(result.isPresent());
        assertEquals("cached-response", result.get());
    }

    @Test
    void getResponse_nonExistingKey_returnsEmpty() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("idempotency:key-999")).thenReturn(null);

        Optional<String> result = idempotencyService.getResponse("key-999");

        assertTrue(result.isEmpty());
    }

    @Test
    void store_keyStoresInRedis() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        idempotencyService.store("key-456", "new-response");

        verify(valueOperations, times(1)).set(eq("idempotency:key-456"), anyString(), eq(Duration.ofMinutes(10)));
    }

    @Test
    void checkAndStore_redisUnavailable_fallsBackToMemory() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doThrow(new RuntimeException("Redis down")).when(valueOperations).setIfAbsent(anyString(), anyString(), any(Duration.class));

        boolean first = idempotencyService.checkAndStore("mem-key-1", "response-1");
        boolean second = idempotencyService.checkAndStore("mem-key-1", "response-2");

        assertTrue(first);
        assertFalse(second);
    }

    @Test
    void getResponse_redisUnavailable_fallsBackToMemory() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doThrow(new RuntimeException("Redis down")).when(valueOperations).set(anyString(), anyString(), any(Duration.class));
        doThrow(new RuntimeException("Redis down")).when(valueOperations).get(anyString());

        idempotencyService.store("mem-key-2", "memory-response");

        Optional<String> result = idempotencyService.getResponse("mem-key-2");

        assertTrue(result.isPresent());
        assertEquals("memory-response", result.get());
    }

    @Test
    void markProcessing_newKey_returnsTrue() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(true);

        boolean result = idempotencyService.markProcessing("proc-key-1");

        assertTrue(result);
    }

    @Test
    void markProcessing_duplicateKey_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class))).thenReturn(false);

        boolean result = idempotencyService.markProcessing("proc-key-1");

        assertFalse(result);
    }

    @Test
    void markProcessing_nullKey_returnsTrue() {
        assertTrue(idempotencyService.markProcessing(null));
        assertTrue(idempotencyService.markProcessing(""));
        assertTrue(idempotencyService.markProcessing("   "));
    }

    @Test
    void isProcessing_processingMarker_returnsTrue() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("idempotency:proc-key-1")).thenReturn("{\"status\":\"PROCESSING\"}");

        boolean result = idempotencyService.isProcessing("proc-key-1");

        assertTrue(result);
    }

    @Test
    void isProcessing_completedMarker_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("idempotency:proc-key-1")).thenReturn("{\"status\":\"COMPLETED\",\"response\":\"done\"}");

        boolean result = idempotencyService.isProcessing("proc-key-1");

        assertFalse(result);
    }

    @Test
    void isProcessing_nonExistingKey_returnsFalse() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("idempotency:proc-key-1")).thenReturn(null);

        boolean result = idempotencyService.isProcessing("proc-key-1");

        assertFalse(result);
    }

    @Test
    void markProcessing_redisUnavailable_fallsBackToMemory() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doThrow(new RuntimeException("Redis down")).when(valueOperations).setIfAbsent(anyString(), anyString(), any(Duration.class));

        boolean first = idempotencyService.markProcessing("mem-proc-1");
        boolean second = idempotencyService.markProcessing("mem-proc-1");

        assertTrue(first);
        assertFalse(second);
    }

    @Test
    void isProcessing_redisUnavailable_fallsBackToMemory() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        doThrow(new RuntimeException("Redis down")).when(valueOperations).setIfAbsent(anyString(), anyString(), any(Duration.class));
        doThrow(new RuntimeException("Redis down")).when(valueOperations).get(anyString());

        idempotencyService.markProcessing("mem-proc-2");

        boolean result = idempotencyService.isProcessing("mem-proc-2");

        assertTrue(result);
    }
}
