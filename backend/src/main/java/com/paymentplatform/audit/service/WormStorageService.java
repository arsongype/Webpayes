package com.paymentplatform.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.audit.entity.AuditEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WormStorageService {

    private final ObjectMapper objectMapper;

    @Value("${audit.worm.enabled:false}")
    private boolean wormEnabled;

    @Value("${audit.worm.directory:./audit-logs}")
    private String wormDirectory;

    @Value("${audit.worm.encryption-key:}")
    private String encryptionKey;

    public void append(AuditEvent event, Map<String, Object> metadata) {
        if (!wormEnabled) {
            return;
        }

        try {
            Path dir = Path.of(wormDirectory);
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            String day = event.getEventTime().toString().substring(0, 10);
            Path file = dir.resolve("audit-" + day + ".log.enc");

            String payload = buildPayload(event, metadata);
            String encrypted = encrypt(payload);

            String line = event.getId() + "|" + event.getEventTime() + "|" + encrypted + "\n";

            Files.writeString(file, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            log.error("Failed to append audit event to WORM storage", e);
        }
    }

    private String buildPayload(AuditEvent event, Map<String, Object> metadata) {
        try {
            java.util.HashMap<String, Object> map = new java.util.HashMap<>();
            map.put("id", event.getId() != null ? event.getId().toString() : null);
            map.put("eventTime", event.getEventTime() != null ? event.getEventTime().toString() : null);
            map.put("eventType", event.getEventType());
            map.put("action", event.getAction());
            map.put("outcome", event.getOutcome() != null ? event.getOutcome().name() : null);
            map.put("resourceType", event.getResourceType());
            map.put("resourceId", event.getResourceId());
            map.put("description", event.getDescription());
            map.put("actorId", event.getActorId() != null ? event.getActorId().toString() : null);
            map.put("actorEmail", event.getActorEmail());
            map.put("actorIp", event.getActorIp());
            map.put("requestId", event.getRequestId());
            map.put("traceId", event.getTraceId());
            map.put("prevHash", event.getPrevHash());
            map.put("hashChain", event.getHashChain());
            map.put("metadata", metadata != null ? metadata : new java.util.HashMap<>());
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return event.getId() + "|" + event.getEventType() + "|" + event.getAction();
        }
    }

    private String encrypt(String data) {
        try {
            if (encryptionKey == null || encryptionKey.isBlank()) {
                return Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8));
            }

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(encryptionKey.getBytes(StandardCharsets.UTF_8));
            SecretKey secretKey = new SecretKeySpec(keyBytes, "AES");

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] iv = new byte[12];
            new SecureRandom().nextBytes(iv);
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, spec);
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            log.warn("WORM encryption failed, storing plaintext", e);
            return Base64.getEncoder().encodeToString(data.getBytes(StandardCharsets.UTF_8));
        }
    }
}
