package com.paymentplatform.notification.controller;

import com.paymentplatform.notification.dto.NotificationDTO;
import com.paymentplatform.notification.dto.SmsRequest;
import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.notification.service.SmsNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SmsNotificationService smsNotificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> list() {
        return ResponseEntity.ok(notificationService.listNotifications());
    }

    @PostMapping("/sms/send")
    public ResponseEntity<String> sendSms(@RequestBody SmsRequest request) {
        String result = smsNotificationService.sendSms(request.getPhoneNumber(), request.getMessage());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/sms/kyc-status")
    public ResponseEntity<String> sendKycStatusSms(@RequestParam String phoneNumber, @RequestParam String status) {
        String result = smsNotificationService.sendKycStatusSms(phoneNumber, status);
        return ResponseEntity.ok(result);
    }
}