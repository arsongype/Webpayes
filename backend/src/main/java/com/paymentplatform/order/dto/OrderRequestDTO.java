package com.paymentplatform.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderRequestDTO {
    @NotNull(message = "Le produit est requis")
    private UUID productId;

    @NotNull(message = "La quantité est requise")
    @Min(value = 1, message = "La quantité doit être d'au moins 1")
    private Integer quantity;

    private String paymentReference;
}
