package com.paymentplatform.merchant;

import com.paymentplatform.merchant.dto.PurchaseRequest;
import com.paymentplatform.transaction.dto.TransferRequestDTO;
import com.paymentplatform.transaction.dto.TransferResponseDTO;
import com.paymentplatform.transaction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/merchant")
@RequiredArgsConstructor
public class MerchantController {
    private final TransactionService transactionService;

    // Simple in-memory product list for demo
    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> products() {
        List<Map<String, Object>> list = List.of(
                Map.of("id", "prod-1", "name", "Sample Item A", "price", 10.0),
                Map.of("id", "prod-2", "name", "Sample Item B", "price", 25.0)
        );
        return ResponseEntity.ok(list);
    }

    @PostMapping("/pay")
    public ResponseEntity<TransferResponseDTO> pay(@RequestBody PurchaseRequest req) {
        TransferRequestDTO dto = TransferRequestDTO.builder()
                .senderAccountId(req.getSenderAccountId().toString())
                .receiverAccountId(req.getReceiverAccountId())
                .receiverOperator(req.getReceiverOperator())
                .amount(req.getAmount())
                .description(req.getDescription())
                .build();

        TransferResponseDTO response = transactionService.transfer(dto);
        return ResponseEntity.ok(response);
    }
}
