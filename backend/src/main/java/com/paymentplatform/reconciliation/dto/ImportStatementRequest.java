package com.paymentplatform.reconciliation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportStatementRequest {

    @NotBlank
    private String fileName;

    @NotBlank
    private String xmlContent;
}
