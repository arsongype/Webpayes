package com.paymentplatform.vault.controller;

import com.paymentplatform.vault.dto.DetokenizeRequest;
import com.paymentplatform.vault.dto.DetokenizeResponse;
import com.paymentplatform.vault.dto.TokenizeRequest;
import com.paymentplatform.vault.dto.TokenizeResponse;
import com.paymentplatform.vault.service.VaultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vault")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    @PostMapping("/tokenize")
    public ResponseEntity<TokenizeResponse> tokenize(@Valid @RequestBody TokenizeRequest request) {
        TokenizeResponse response = vaultService.tokenize(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/detokenize")
    public ResponseEntity<DetokenizeResponse> detokenize(@Valid @RequestBody DetokenizeRequest request) {
        DetokenizeResponse response = vaultService.detokenize(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/tokens/{token}/deactivate")
    public ResponseEntity<Void> deactivateToken(@PathVariable String token) {
        vaultService.deactivateToken(token);
        return ResponseEntity.ok().build();
    }
}
