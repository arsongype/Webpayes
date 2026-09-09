package com.paymentplatform.idempotency;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyInterceptorTest {

    @Mock
    private IdempotencyService idempotencyService;

    private IdempotencyInterceptor interceptor;

    @BeforeEach
    void setUp() {
        interceptor = new IdempotencyInterceptor(idempotencyService);
    }

    @Test
    void preHandle_noIdempotencyKey_returnsTrue() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request, response, null);

        assertTrue(result);
        assertEquals(200, response.getStatus());
    }

    @Test
    void preHandle_blankIdempotencyKey_returnsTrue() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Idempotency-Key", "   ");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean result = interceptor.preHandle(request, response, null);

        assertTrue(result);
        assertEquals(200, response.getStatus());
    }

    @Test
    void preHandle_requestInProgress_returns409() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Idempotency-Key", "key-123");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(idempotencyService.isProcessing("key-123")).thenReturn(true);

        boolean result = interceptor.preHandle(request, response, null);

        assertFalse(result);
        assertEquals(409, response.getStatus());
    }

    @Test
    void preHandle_completedRequest_returnsTrue() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Idempotency-Key", "key-456");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(idempotencyService.isProcessing("key-456")).thenReturn(false);
        when(idempotencyService.markProcessing("key-456")).thenReturn(true);

        boolean result = interceptor.preHandle(request, response, null);

        assertTrue(result);
        verify(idempotencyService, times(1)).markProcessing("key-456");
    }

    @Test
    void preHandle_markProcessingFails_returnsFalse() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Idempotency-Key", "key-789");
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(idempotencyService.isProcessing("key-789")).thenReturn(false);
        when(idempotencyService.markProcessing("key-789")).thenReturn(false);

        boolean result = interceptor.preHandle(request, response, null);

        assertFalse(result);
        verify(idempotencyService, times(1)).markProcessing("key-789");
    }
}
