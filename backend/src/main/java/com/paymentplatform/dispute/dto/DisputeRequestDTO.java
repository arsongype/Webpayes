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
public class DisputeRequestDTO {
    private UUID transactionId;
    private String reason;
    private String description;
}
