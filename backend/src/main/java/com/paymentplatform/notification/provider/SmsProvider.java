package com.paymentplatform.notification.provider;

import org.springframework.stereotype.Component;

@Component
public class SmsProvider {

    public String sendSms(String phoneNumber, String message) {
        String simulatedMessage = "[SMS SIMULÉ] To: " + phoneNumber + " | Message: " + message;
        System.out.println(simulatedMessage);
        return "SENT_" + System.currentTimeMillis();
    }

    public boolean isHealthy() {
        return true;
    }
}
