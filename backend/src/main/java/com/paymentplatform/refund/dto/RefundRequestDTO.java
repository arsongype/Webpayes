package com.paymentplatform.refund.dto;

import com.paymentplatform.refund.entity.RefundStatus;
import com.paymentplatform.user.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDTO {
    private UUID transactionId;
    private BigDecimal amount;
    private String reason;
}
