package com.paymentplatform.audit.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.audit.entity.AuditEvent;
import com.paymentplatform.audit.repository.AuditEventRepository;
import com.paymentplatform.security.CurrentUserService;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * PCI-DSS Requirement 10 audit trail service.
 * Hash-chain for tamper evidence + 7-year retention.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditEventRepository repository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;
    private final Tracer tracer;

    private static final long RETENTION_DAYS = 2555; // ~7 years per PCI-DSS

    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized void log(String eventType, String action, AuditEvent.Outcome outcome,
                    String resourceType, String resourceId, String description,
                    Map<String, Object> metadata) {
        try {
            AuditEvent event = buildEvent(eventType, action, outcome, resourceType, resourceId, description, metadata);
            String prevHash = getLatestHash();
            event.setPrevHash(prevHash);
            event.setHashChain(computeHashChain(event, prevHash));
            event.setRetentionUntil(Instant.now().plus(RETENTION_DAYS, ChronoUnit.DAYS));
            repository.save(event);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to persist audit event [type={}, action={}, outcome={}]: {}",
                eventType, action, outcome, e.getMessage(), e);
        }
    }

    @Transactional
    public AuditEvent logSync(String eventType, String action, AuditEvent.Outcome outcome,
                              String resourceType, String resourceId, String description,
                              Map<String, Object> metadata) {
        AuditEvent event = buildEvent(eventType, action, outcome, resourceType, resourceId, description, metadata);
        String prevHash = getLatestHash();
        event.setPrevHash(prevHash);
        event.setHashChain(computeHashChain(event, prevHash));
        event.setRetentionUntil(Instant.now().plus(RETENTION_DAYS, ChronoUnit.DAYS));
        return repository.save(event);
    }

    public Page<AuditEvent> findAll(Pageable pageable) {
        return repository.findAllByOrderByEventTimeDesc(pageable);
    }

    public Page<AuditEvent> findByActor(UUID actorId, Pageable pageable) {
        return repository.findByActorIdOrderByEventTimeDesc(actorId, pageable);
    }

    public Page<AuditEvent> findByEventType(String eventType, Pageable pageable) {
        return repository.findByEventTypeOrderByEventTimeDesc(eventType, pageable);
    }

    public Page<AuditEvent> findByPeriod(Instant from, Instant to, Pageable pageable) {
        return repository.findByEventTimeBetweenOrderByEventTimeDesc(from, to, pageable);
    }

    public List<AuditEvent> findRecentByActor(UUID actorId, int hours) {
        Instant since = Instant.now().minus(hours, ChronoUnit.HOURS);
        return repository.findByActorIdAndEventTimeAfter(actorId, since);
    }

    public long count(String eventType, AuditEvent.Outcome outcome) {
        return repository.countByEventTypeAndOutcome(eventType, outcome);
    }

    public boolean verifyHashChain(List<AuditEvent> events) {
        String prevHash = null;
        for (AuditEvent e : events) {
            if (prevHash != null && !prevHash.equals(e.getPrevHash())) {
                return false;
            }
            String recomputed = computeHashChain(e, prevHash);
            if (!recomputed.equals(e.getHashChain())) {
                log.error("Audit chain integrity broken at event {}", e.getId());
                return false;
            }
            prevHash = e.getHashChain();
        }
        return true;
    }

    private AuditEvent buildEvent(String eventType, String action, AuditEvent.Outcome outcome,
                                  String resourceType, String resourceId, String description,
                                  Map<String, Object> metadata) {
        AuditEvent.AuditEventBuilder builder = AuditEvent.builder()
            .eventTime(Instant.now())
            .eventType(eventType)
            .severity(mapSeverity(eventType, outcome))
            .action(action)
            .outcome(outcome)
            .resourceType(resourceType)
            .resourceId(resourceId)
            .description(description)
            .metadata(metadata);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                UUID userId = currentUserService.getCurrentUserId();
                String email = currentUserService.getCurrentUserEmail();
                builder.actorId(userId).actorEmail(email);
            }
        } catch (Exception ignored) { }

        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest req = attrs.getRequest();
                builder.actorIp(extractIp(req));
                builder.userAgent(truncate(req.getHeader("User-Agent"), 512));
                builder.requestId(req.getHeader("X-Request-Id"));
            }
        } catch (Exception ignored) { }

        try {
            if (tracer != null && tracer.currentSpan() != null) {
                builder.traceId(tracer.currentSpan().context().traceId());
            }
        } catch (Exception ignored) { }

        return builder.build();
    }

    private String getLatestHash() {
        Page<AuditEvent> latest = repository.findAllByOrderByEventTimeDesc(
            org.springframework.data.domain.PageRequest.of(0, 1));
        if (latest.isEmpty()) return null;
        return latest.getContent().get(0).getHashChain();
    }

    private String computeHashChain(AuditEvent event, String prevHash) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append(event.getEventType()).append('|')
              .append(event.getAction()).append('|')
              .append(event.getOutcome()).append('|')
              .append(event.getEventTime().toString()).append('|')
              .append(event.getActorId() != null ? event.getActorId() : "-").append('|')
              .append(event.getResourceId() != null ? event.getResourceId() : "-").append('|')
              .append(prevHash != null ? prevHash : "GENESIS").append('|')
              .append(event.getDescription() != null ? event.getDescription() : "");
            if (event.getMetadata() != null) {
                sb.append('|').append(objectMapper.writeValueAsString(event.getMetadata()));
            }
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(sb.toString().getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return UUID.randomUUID().toString();
        }
    }

    private AuditEvent.Severity mapSeverity(String type, AuditEvent.Outcome outcome) {
        if (outcome == AuditEvent.Outcome.DENIED || outcome == AuditEvent.Outcome.FAILURE) return AuditEvent.Severity.WARN;
        if (type.contains("AUTH") || type.contains("KYC") || type.contains("VAULT") || type.contains("REFUND")) {
            return AuditEvent.Severity.INFO;
        }
        return AuditEvent.Severity.INFO;
    }

    private String extractIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }
}
