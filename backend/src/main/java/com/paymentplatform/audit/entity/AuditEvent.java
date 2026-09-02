package com.paymentplatform.audit.entity;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
@Entity
@Table(name = "audit_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditEvent {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "event_time", nullable = false)
    private Instant eventTime;

    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Severity severity = Severity.INFO;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "actor_email", length = 255)
    private String actorEmail;

    @Column(name = "actor_ip", length = 64)
    private String actorIp;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "request_id", length = 64)
    private String requestId;

    @Column(name = "trace_id", length = 64)
    private String traceId;

    @Column(name = "resource_type", length = 64)
    private String resourceType;

    @Column(name = "resource_id", length = 128)
    private String resourceId;

    @Column(nullable = false, length = 64)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private Outcome outcome = Outcome.SUCCESS;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "prev_hash", length = 128)
    private String prevHash;

    @Column(name = "hash_chain", nullable = false, length = 128)
    private String hashChain;

    @Column(name = "retention_until", nullable = false)
    private Instant retentionUntil;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    public enum Severity { INFO, WARN, ERROR, CRITICAL }
    public enum Outcome { SUCCESS, FAILURE, DENIED, PARTIAL }
}
