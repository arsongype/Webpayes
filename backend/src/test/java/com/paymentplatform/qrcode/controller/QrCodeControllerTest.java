package com.paymentplatform.qrcode.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.paymentplatform.qrcode.dto.QrGenerateRequest;
import com.paymentplatform.qrcode.dto.QrGenerateResponse;
import com.paymentplatform.qrcode.dto.QrValidateRequest;
import com.paymentplatform.qrcode.service.QrCodeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = QrCodeController.class)
@AutoConfigureMockMvc(addFilters = false)
class QrCodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private QrCodeService qrCodeService;

    @MockBean
    private com.paymentplatform.security.jwt.JwtTokenProvider jwtTokenProvider;

    @MockBean
    private com.paymentplatform.security.UserDetailsServiceImpl userDetailsServiceImpl;

    @MockBean
    private com.paymentplatform.security.jwt.JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void generateQr_returnsOk() throws Exception {
        QrGenerateRequest req = QrGenerateRequest.builder()
                .merchantName("Test Merchant")
                .accountNumber("ACCT-123")
                .amount(new BigDecimal("1000"))
                .currency("MGA")
                .description("Test payment")
                .build();

        QrGenerateResponse resp = QrGenerateResponse.builder()
                .qrDataUrl("data:image/png;base64,abc")
                .paymentReference("QR-ABC123")
                .merchantName("Test Merchant")
                .accountNumber("ACCT-123")
                .amount("1000")
                .currency("MGA")
                .description("Test payment")
                .build();

        when(qrCodeService.generatePaymentQr(any(QrGenerateRequest.class))).thenReturn(resp);

        mockMvc.perform(post("/api/qr/generate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }

    @Test
    void validateQr_returnsOk() throws Exception {
        String qrData = "WEBPAY-QR://pay?ref=QR-123&merchant=Test&account=ACCT-1&amount=100&currency=MGA&desc=Test";

        when(qrCodeService.parseQrData(anyString())).thenReturn("ref=QR-123&merchant=Test&account=ACCT-1&amount=100&currency=MGA&desc=Test");

        QrValidateRequest req = new QrValidateRequest(qrData, UUID.randomUUID().toString());

        mockMvc.perform(post("/api/qr/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());
    }
}
