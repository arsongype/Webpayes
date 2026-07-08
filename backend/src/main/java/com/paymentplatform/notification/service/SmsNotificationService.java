package com.paymentplatform.notification.service;

import com.paymentplatform.notification.dto.SmsRequest;
import com.paymentplatform.notification.provider.SmsProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsNotificationService {

    private final SmsProvider smsProvider;

    @Async
    public String sendSms(String phoneNumber, String message) {
        return smsProvider.sendSms(phoneNumber, message);
    }

    @Async
    public String sendKycStatusSms(String phoneNumber, String status) {
        String message = "Votre vérification KYC est maintenant : " + status;
        return smsProvider.sendSms(phoneNumber, message);
    }
}
