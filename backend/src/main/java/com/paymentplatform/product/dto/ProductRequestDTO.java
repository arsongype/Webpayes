package com.paymentplatform.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequestDTO {
    @NotBlank(message = "Le nom est requis")
    private String name;

    private String description;

    @NotNull(message = "Le prix est requis")
    @DecimalMin(value = "0.01", message = "Le prix doit être supérieur à 0")
    private BigDecimal price;

    private String currency = "MGA";
    private String imageUrl;
    private Integer stock = 0;
    private Boolean active = true;
}
