package com.paymentplatform.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private UUID id;
    private String recipient;
    private String subject;
    private String body;
    private String type;
    private String status;
    private Instant createdAt;
}