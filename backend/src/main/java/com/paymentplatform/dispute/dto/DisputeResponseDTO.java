package com.paymentplatform.dispute.dto;

import com.paymentplatform.dispute.entity.DisputeStatus;
import com.paymentplatform.user.dto.UserDTO;
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
public class DisputeResponseDTO {
    private UUID id;
    private UUID transactionId;
    private String reason;
    private String description;
    private DisputeStatus status;
    private String resolution;
    private UserDTO createdBy;
    private UserDTO resolvedBy;
    private Instant resolvedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
