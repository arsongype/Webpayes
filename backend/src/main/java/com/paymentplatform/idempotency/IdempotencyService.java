package com.paymentplatform.idempotency;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private final ConcurrentHashMap<String, String> memoryStore = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String IDEMPOTENCY_KEY_PREFIX = "idempotency:";
    private static final Duration TTL = Duration.ofMinutes(10);
    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_COMPLETED = "COMPLETED";

    public IdempotencyService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean checkAndStore(String idempotencyKey, String response) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return false;
        }

        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

        try {
            String wrapped = wrapResponse(response);
            Boolean wasSet = redisTemplate.opsForValue().setIfAbsent(key, wrapped, TTL);
            if (Boolean.FALSE.equals(wasSet)) {
                log.warn("Duplicate request detected with idempotency key: {}", idempotencyKey);
                return false;
            }
            return true;
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to in-memory idempotency for key: {}", idempotencyKey, e);
            String wrapped = wrapResponse(response);
            if (memoryStore.putIfAbsent(key, wrapped) != null) {
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
            if (cached != null) return parseResponse(cached);
        } catch (Exception e) {
            // Fallback to memory store
        }

        return parseResponse(memoryStore.get(key));
    }

    public void store(String idempotencyKey, String response) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return;
        }
        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;
        String wrapped = wrapResponse(response);

        try {
            redisTemplate.opsForValue().set(key, wrapped, TTL);
        } catch (Exception e) {
            memoryStore.put(key, wrapped);
        }
    }

    public boolean markProcessing(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return true;
        }

        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;
        Map<String, String> processingMarker = new HashMap<>();
        processingMarker.put("status", STATUS_PROCESSING);

        try {
            String markerJson = objectMapper.writeValueAsString(processingMarker);
            Boolean wasSet = redisTemplate.opsForValue().setIfAbsent(key, markerJson, TTL);
            return Boolean.TRUE.equals(wasSet);
        } catch (Exception e) {
            log.warn("Redis unavailable, falling back to in-memory processing marker for key: {}", idempotencyKey, e);
            return memoryStore.putIfAbsent(key, markerJson(processingMarker)) == null;
        }
    }

    public boolean isProcessing(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return false;
        }

        String key = IDEMPOTENCY_KEY_PREFIX + idempotencyKey;

        try {
            String value = redisTemplate.opsForValue().get(key);
            if (value != null && isProcessingMarker(value)) {
                return true;
            }
        } catch (Exception e) {
            // Fallback to memory store
        }

        String memoryValue = memoryStore.get(key);
        return memoryValue != null && isProcessingMarker(memoryValue);
    }

    private Optional<String> parseResponse(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        try {
            Map<String, Object> map = objectMapper.readValue(value, Map.class);
            String status = (String) map.get("status");
            if (STATUS_COMPLETED.equals(status) && map.containsKey("response")) {
                return Optional.of((String) map.get("response"));
            }
        } catch (Exception e) {
            log.warn("Failed to parse idempotency value: {}", value, e);
        }
        return Optional.empty();
    }

    private boolean isProcessingMarker(String value) {
        try {
            Map<String, Object> map = objectMapper.readValue(value, Map.class);
            return STATUS_PROCESSING.equals(map.get("status"));
        } catch (Exception e) {
            return false;
        }
    }

    private String markerJson(Map<String, String> marker) {
        try {
            return objectMapper.writeValueAsString(marker);
        } catch (JsonProcessingException e) {
            return "{\"status\":\"" + STATUS_PROCESSING + "\"}";
        }
    }

    private String wrapResponse(String response) {
        try {
            Map<String, String> wrapper = new HashMap<>();
            wrapper.put("status", STATUS_COMPLETED);
            wrapper.put("response", response);
            return objectMapper.writeValueAsString(wrapper);
        } catch (JsonProcessingException e) {
            return "{\"status\":\"" + STATUS_COMPLETED + "\",\"response\":\"" + response.replace("\"", "\\\"") + "\"}";
        }
    }
}
