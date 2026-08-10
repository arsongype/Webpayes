package com.paymentplatform.notification.service;

import com.paymentplatform.account.entity.Account;
import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.notification.dto.NotificationDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.user.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.lang.NonNull;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final ConcurrentLinkedQueue<NotificationDTO> store = new ConcurrentLinkedQueue<>();
    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<NotificationDTO>> userStores = new ConcurrentHashMap<>();

    @Async
    @Transactional
    public void sendTransactionNotification(Transaction transaction) {
        if (transaction == null || transaction.getSenderAccount() == null) {
            return;
        }

        User sender = transaction.getSenderAccount().getUser();
        Account receiverAccount = transaction.getReceiverAccount();
        User receiver = receiverAccount != null ? receiverAccount.getUser() : null;

        sendEmail(sender.getEmail(), "Transfert envoyé", "transaction-confirmation", Map.of(
                "firstName", sender.getFirstName(),
                "amount", transaction.getAmount(),
                "reference", transaction.getReference(),
                "date", Instant.now().toString()
        ));

        if (receiver != null) {
            sendEmail(receiver.getEmail(), "Transfert reçu", "transaction-received", Map.of(
                    "firstName", receiver.getFirstName(),
                    "amount", transaction.getAmount(),
                    "reference", transaction.getReference(),
                    "senderName", sender.getFirstName() + " " + sender.getLastName(),
                    "date", Instant.now().toString()
            ));

            NotificationDTO receiverNotification = NotificationDTO.builder()
                    .id(java.util.UUID.randomUUID())
                    .recipient(receiver.getEmail())
                    .subject("Transfert reçu")
                    .body("Vous avez reçu " + transaction.getAmount() + " MGA de " + sender.getFirstName() + " " + sender.getLastName() + ". Référence: " + transaction.getReference())
                    .type("TRANSACTION")
                    .status("SENT")
                    .createdAt(Instant.now())
                    .build();
            store.add(receiverNotification);
            userStores.computeIfAbsent(receiver.getEmail(), k -> new ConcurrentLinkedQueue<>()).add(receiverNotification);
        }

        NotificationDTO senderNotification = NotificationDTO.builder()
                .id(java.util.UUID.randomUUID())
                .recipient(sender.getEmail())
                .subject("Transfert envoyé")
                .body("Vous avez envoyé " + transaction.getAmount() + " MGA. Référence: " + transaction.getReference())
                .type("TRANSACTION")
                .status("SENT")
                .createdAt(Instant.now())
                .build();
        store.add(senderNotification);
        userStores.computeIfAbsent(sender.getEmail(), k -> new ConcurrentLinkedQueue<>()).add(senderNotification);
    }

    @Async
    public void sendEmail(@NonNull String to, @NonNull String subject, @NonNull String templateName, @NonNull Map<String, Object> variables) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);

            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new BusinessException("Erreur lors de l'envoi de l'email", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public List<NotificationDTO> listNotifications() {
        return new ArrayList<>(store.stream().limit(50).collect(Collectors.toList()));
    }

    public List<NotificationDTO> listNotificationsForUser(String userEmail) {
        if (userEmail == null || userEmail.isBlank()) {
            return List.of();
        }
        ConcurrentLinkedQueue<NotificationDTO> userQueue = userStores.computeIfAbsent(userEmail, k -> new ConcurrentLinkedQueue<>());
        return new ArrayList<>(userQueue.stream().limit(50).collect(Collectors.toList()));
    }

    public void addNotification(NotificationDTO notification) {
        if (notification == null || notification.getRecipient() == null) {
            return;
        }
        store.add(notification);
        userStores.computeIfAbsent(notification.getRecipient(), k -> new ConcurrentLinkedQueue<>()).add(notification);
    }
}