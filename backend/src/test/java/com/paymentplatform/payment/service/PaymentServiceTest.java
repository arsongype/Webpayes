package com.paymentplatform.payment.service;

import com.paymentplatform.aiclient.FraudDetectionClient;
import com.paymentplatform.aiclient.FraudDetectionRequest;
import com.paymentplatform.aiclient.FraudDetectionResponse;
import com.paymentplatform.aiclient.RoutingClient;
import com.paymentplatform.aiclient.RoutingRequest;
import com.paymentplatform.aiclient.RoutingResponse;
import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentMethodType;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.exec.BankTransferExec;
import com.paymentplatform.payment.exec.CardPaymentExec;
import com.paymentplatform.payment.exec.MobileMoneyPaymentExec;
import com.paymentplatform.payment.gateway.PaymentGateway;
import com.paymentplatform.payment.gateway.PaymentGatewayFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private CardPaymentExec cardPaymentExec;

    @Mock
    private MobileMoneyPaymentExec mobileMoneyPaymentExec;

    @Mock
    private BankTransferExec bankTransferExec;

    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(cardPaymentExec, mobileMoneyPaymentExec, bankTransferExec);
    }

    @Test
    void processPayment_card_success_returnsCardResponse() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.CARD)
                .amount(100.0)
                .currency("MGA")
                .build();

        PaymentResponse cardResponse = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(PaymentStatus.SUCCESS)
                .success(true)
                .message("OK")
                .build();

        when(cardPaymentExec.execute(request)).thenReturn(cardResponse);

        PaymentResponse result = paymentService.processPayment(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertEquals("OK", result.getMessage());
        verify(cardPaymentExec, times(1)).execute(request);
        verify(mobileMoneyPaymentExec, never()).execute(any());
        verify(bankTransferExec, never()).execute(any());
    }

    @Test
    void processPayment_card_failure_triggersFallback() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.CARD)
                .amount(100.0)
                .currency("MGA")
                .mobileMoneyPhone("+261340000000")
                .mobileMoneyOperator(com.paymentplatform.payment.enums.MobileMoneyOperator.ORANGE_MONEY_CI)
                .build();

        PaymentResponse cardResponse = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(PaymentStatus.FAILED)
                .success(false)
                .message("Card declined")
                .build();

        PaymentResponse fallbackResponse = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(PaymentStatus.SUCCESS)
                .success(true)
                .message("Fallback OK")
                .fallbackUsed(true)
                .build();

        when(cardPaymentExec.execute(request)).thenReturn(cardResponse);
        when(mobileMoneyPaymentExec.execute(any(PaymentRequest.class))).thenReturn(fallbackResponse);

        PaymentResponse result = paymentService.processPayment(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        assertTrue(result.isFallbackUsed());
        verify(cardPaymentExec, times(1)).execute(request);
        verify(mobileMoneyPaymentExec, times(1)).execute(any());
    }

    @Test
    void processPayment_mobileMoney_callsMobileMoneyExec() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.MOBILE_MONEY)
                .amount(50.0)
                .currency("MGA")
                .build();

        PaymentResponse mmResponse = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(PaymentStatus.SUCCESS)
                .success(true)
                .message("MM OK")
                .build();

        when(mobileMoneyPaymentExec.execute(request)).thenReturn(mmResponse);

        PaymentResponse result = paymentService.processPayment(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        verify(mobileMoneyPaymentExec, times(1)).execute(request);
    }

    @Test
    void processPayment_bankTransfer_callsBankTransferExec() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(PaymentMethodType.BANK_TRANSFER)
                .amount(200.0)
                .currency("MGA")
                .destinationAccount("ACCT-123")
                .build();

        PaymentResponse btResponse = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(PaymentStatus.SUCCESS)
                .success(true)
                .message("BT OK")
                .build();

        when(bankTransferExec.execute(request)).thenReturn(btResponse);

        PaymentResponse result = paymentService.processPayment(request);

        assertNotNull(result);
        assertTrue(result.isSuccess());
        verify(bankTransferExec, times(1)).execute(request);
    }

    @Test
    void processPayment_unsupportedMethod_returnsErrorResponse() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentMethod(null)
                .amount(100.0)
                .currency("MGA")
                .build();

        PaymentResponse result = paymentService.processPayment(request);

        assertNotNull(result);
        assertFalse(result.isSuccess());
        verify(cardPaymentExec, never()).execute(any());
        verify(mobileMoneyPaymentExec, never()).execute(any());
        verify(bankTransferExec, never()).execute(any());
    }
}
