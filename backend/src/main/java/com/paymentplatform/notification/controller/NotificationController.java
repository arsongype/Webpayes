package com.paymentplatform.notification.controller;

import com.paymentplatform.notification.dto.NotificationDTO;
import com.paymentplatform.notification.dto.SmsRequest;
import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.notification.service.SmsNotificationService;
import com.paymentplatform.security.CurrentUserService;
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
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> list() {
        String userEmail = currentUserService.getCurrentUser().getEmail();
        return ResponseEntity.ok(notificationService.listNotificationsForUser(userEmail));
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

    @PostMapping("/demo")
    public ResponseEntity<String> seedDemoNotifications() {
        NotificationDTO demo = NotificationDTO.builder()
                .id(java.util.UUID.randomUUID())
                .recipient(currentUserService.getCurrentUser().getEmail())
                .subject("Bienvenue")
                .body("Bienvenue sur WebPaysh ! Ceci est une notification de démonstration.")
                .type("SYSTEM")
                .status("SENT")
                .createdAt(java.time.Instant.now())
                .build();
        notificationService.addNotification(demo);
        return ResponseEntity.ok("OK");
    }
}