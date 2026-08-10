package com.paymentplatform.qrcode.controller;

import com.paymentplatform.qrcode.dto.QrGenerateRequest;
import com.paymentplatform.qrcode.dto.QrGenerateResponse;
import com.paymentplatform.qrcode.dto.QrValidateRequest;
import com.paymentplatform.qrcode.service.QrCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;

    @PostMapping("/generate")
    public ResponseEntity<QrGenerateResponse> generate(@Valid @RequestBody QrGenerateRequest request) {
        QrGenerateResponse response = qrCodeService.generatePaymentQr(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/generate/pdf")
    public ResponseEntity<byte[]> generatePdf(@Valid @RequestBody QrGenerateRequest request) {
        byte[] pdfBytes = qrCodeService.generatePaymentQrPdf(request);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "qr-payment.pdf");
        headers.setContentLength(pdfBytes.length);
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@Valid @RequestBody QrValidateRequest request) {
        String parsed = qrCodeService.parseQrData(request.getQrData());
        if (parsed == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("valid", false);
            error.put("message", "QR Code invalide");
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, String> params = parsePayload(parsed);
        Map<String, Object> result = new HashMap<>();
        result.put("valid", true);
        result.put("reference", params.get("ref"));
        result.put("merchantName", params.get("merchant"));
        result.put("accountNumber", params.get("account"));
        result.put("amount", params.get("amount"));
        result.put("currency", params.get("currency"));
        result.put("description", params.get("desc"));
        result.put("senderAccountId", request.getSenderAccountId());

        return ResponseEntity.ok(result);
    }

    private Map<String, String> parsePayload(String payload) {
        Map<String, String> params = new HashMap<>();
        for (String pair : payload.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                params.put(kv[0], kv[1]);
            }
        }
        return params;
    }
}
