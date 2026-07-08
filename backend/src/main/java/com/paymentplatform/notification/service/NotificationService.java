package com.paymentplatform.notification.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.notification.dto.NotificationDTO;
import com.paymentplatform.transaction.entity.Transaction;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.user.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final UserRepository userRepository;

    @Async
    @Transactional
    public void sendTransactionNotification(Transaction transaction) {
        User sender = transaction.getSenderAccount().getUser();
        User receiver = transaction.getReceiverAccount().getUser();

        sendEmail(sender.getEmail(), "Transfert envoyé", "transaction-confirmation", Map.of(
                "firstName", sender.getFirstName(),
                "amount", transaction.getAmount(),
                "reference", transaction.getReference(),
                "date", Instant.now().toString()
        ));

        sendEmail(receiver.getEmail(), "Transfert reçu", "transaction-received", Map.of(
                "firstName", receiver.getFirstName(),
                "amount", transaction.getAmount(),
                "reference", transaction.getReference(),
                "senderName", sender.getFirstName() + " " + sender.getLastName(),
                "date", Instant.now().toString()
        ));
    }

    @Async
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
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

    public java.util.List<NotificationDTO> listNotifications() {
        return java.util.List.of();
    }
}