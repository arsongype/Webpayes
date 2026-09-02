package com.paymentplatform.payment.exec;

import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;

public interface PaymentExec {
    PaymentResponse execute(PaymentRequest request);
}
