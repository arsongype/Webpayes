package com.paymentplatform.idempotency;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, String> memoryStore = new ConcurrentHashMap<>();

    private static final String IDEMPOTENCY_KEY_PREFIX = "idempotency:";
    private static final Duration TTL = Duration.ofMinutes(10);

    public IdempotencyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean checkAndStore(String idempotencyKey, String response) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return false;
        }

        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

        try {
            Boolean wasSet = redisTemplate.opsForValue().setIfAbsent(key, response, TTL);
            if (Boolean.FALSE.equals(wasSet)) {
                log.warn("Duplicate request detected with idempotency key: {}", idempotencyKey);
                return false;
            }
            return true;
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to in-memory idempotency for key: {}", idempotencyKey, e);
            if (memoryStore.putIfAbsent(key, response) != null) {
                log.warn("Duplicate request detected (memory) for key: {}", idempotencyKey);
                return false;
            }
            return true;
        }
    }

    public Optional<String> getResponse(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return Optional.empty();
        }
        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

        try {
            String cached = redisTemplate.opsForValue().get(key);
            if (cached != null) return Optional.of(cached);
        } catch (Exception e) {
            // Fallback to memory store
        }

        return Optional.ofNullable(memoryStore.get(key));
    }

    public void store(String idempotencyKey, String response) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

        try {
            redisTemplate.opsForValue().set(key, response, TTL);
        } catch (Exception e) {
            memoryStore.put(key, response);
        }
    }
}
