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

import java.math.BigDecimal;
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

        String senderName = sender.getFirstName() + " " + sender.getLastName();
        String receiverName = receiver != null ? receiver.getFirstName() + " " + receiver.getLastName() : "inconnu";

        String txAmount = formatAmount(transaction.getAmount(), transaction.getCurrency());

        sendEmail(sender.getEmail(), "Transfert envoyé", "transaction-confirmation", Map.of(
                "firstName", sender.getFirstName(),
                "amount", txAmount,
                "reference", transaction.getReference(),
                "receiverName", receiverName,
                "senderBalance", formatAmount(transaction.getSenderAccount().getBalance(), transaction.getSenderAccount().getCurrency()),
                "date", Instant.now().toString()
        ));

        if (receiver != null) {
            sendEmail(receiver.getEmail(), "Transfert reçu", "transaction-received", Map.of(
                    "firstName", receiver.getFirstName(),
                    "amount", txAmount,
                    "reference", transaction.getReference(),
                    "senderName", senderName,
                    "receiverBalance", formatAmount(receiverAccount.getBalance(), receiverAccount.getCurrency()),
                    "date", Instant.now().toString()
            ));

            NotificationDTO receiverNotification = NotificationDTO.builder()
                    .id(java.util.UUID.randomUUID())
                    .recipient(receiver.getEmail())
                    .subject("Transfert reçu")
                    .body(String.format("Vous avez reçu %s de %s. Nouveau solde: %s. Référence: %s",
                            txAmount, senderName,
                            formatAmount(receiverAccount.getBalance(), receiverAccount.getCurrency()),
                            transaction.getReference()))
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
                .body(String.format("Vous avez envoyé %s à %s. Solde restant: %s. Référence: %s",
                        txAmount, receiverName,
                        formatAmount(transaction.getSenderAccount().getBalance(), transaction.getSenderAccount().getCurrency()),
                        transaction.getReference()))
                .type("TRANSACTION")
                .status("SENT")
                .createdAt(Instant.now())
                .build();
        store.add(senderNotification);
        userStores.computeIfAbsent(sender.getEmail(), k -> new ConcurrentLinkedQueue<>()).add(senderNotification);
    }

    public void sendPaymentNotification(String recipientEmail, String senderName, String providerLabel,
                                         String amount, String currency, String message,
                                         BigDecimal remainingBalance) {
        String txAmount = formatAmount(new BigDecimal(amount), currency);
        String balanceStr = remainingBalance != null
                ? formatAmount(remainingBalance, currency)
                : null;

        String body = String.format("Paiement de %s via %s. %s", txAmount, providerLabel, message);
        if (balanceStr != null && senderName != null && !senderName.isBlank()) {
            body += String.format(". Solde restant: %s", balanceStr);
        }

        NotificationDTO notification = NotificationDTO.builder()
                .id(java.util.UUID.randomUUID())
                .recipient(recipientEmail)
                .subject("Paiement effectué")
                .body(body)
                .type("PAYMENT")
                .status("SENT")
                .createdAt(Instant.now())
                .build();
        store.add(notification);
        userStores.computeIfAbsent(recipientEmail, k -> new ConcurrentLinkedQueue<>()).add(notification);
    }

    public void sendPaymentReceivedNotification(String receiverEmail, String receiverName, String senderName,
                                                  String amount, String currency, String reference) {
        if (receiverEmail == null || receiverEmail.isBlank()) {
            return;
        }
        String txAmount = formatAmount(new BigDecimal(amount), currency);

        String body = String.format("Vous avez reçu %s de %s. Référence: %s",
                txAmount, senderName != null ? senderName : "un expéditeur",
                reference != null ? reference : "N/A");

        NotificationDTO notification = NotificationDTO.builder()
                .id(java.util.UUID.randomUUID())
                .recipient(receiverEmail)
                .subject("Paiement reçu")
                .body(body)
                .type("PAYMENT_RECEIVED")
                .status("SENT")
                .createdAt(Instant.now())
                .build();
        store.add(notification);
        userStores.computeIfAbsent(receiverEmail, k -> new ConcurrentLinkedQueue<>()).add(notification);
    }

    private String formatAmount(BigDecimal amount, String currency) {
        if (amount == null) return "0 " + currency;
        return String.format("%,.2f %s", amount, currency);
    }

    private String formatAmount(String amount, String currency) {
        try {
            return formatAmount(new BigDecimal(amount), currency);
        } catch (Exception e) {
            return amount + " " + currency;
        }
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