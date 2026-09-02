package com.paymentplatform.audit.dto;

import com.paymentplatform.audit.entity.AuditEvent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public class AuditDTOs {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuditEventView {
        private UUID id;
        private Instant eventTime;
        private String eventType;
        private String severity;
        private UUID actorId;
        private String actorEmail;
        private String actorIp;
        private String requestId;
        private String traceId;
        private String resourceType;
        private String resourceId;
        private String action;
        private String outcome;
        private String description;
        private Map<String, Object> metadata;
        private String hashChain;
        private Instant retentionUntil;

        public static AuditEventView from(AuditEvent e) {
            return AuditEventView.builder()
                .id(e.getId())
                .eventTime(e.getEventTime())
                .eventType(e.getEventType())
                .severity(e.getSeverity() != null ? e.getSeverity().name() : null)
                .actorId(e.getActorId())
                .actorEmail(e.getActorEmail())
                .actorIp(e.getActorIp())
                .requestId(e.getRequestId())
                .traceId(e.getTraceId())
                .resourceType(e.getResourceType())
                .resourceId(e.getResourceId())
                .action(e.getAction())
                .outcome(e.getOutcome() != null ? e.getOutcome().name() : null)
                .description(e.getDescription())
                .metadata(e.getMetadata())
                .hashChain(e.getHashChain())
                .retentionUntil(e.getRetentionUntil())
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IntegrityCheckResult {
        private boolean valid;
        private int eventsChecked;
        private String message;
    }
}
