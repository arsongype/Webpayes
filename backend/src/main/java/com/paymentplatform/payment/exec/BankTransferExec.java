package com.paymentplatform.payment.exec;

import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.gateway.GatewayChargeResult;
import com.paymentplatform.payment.gateway.PaymentGatewayFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BankTransferExec implements PaymentExec {

    private final PaymentGatewayFactory gatewayFactory;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final AccountRepository accountRepository;

    @Override
    public PaymentResponse execute(PaymentRequest request) {
        String destination = request.getDestinationAccount();
        log.info("Initiating bank transfer to account: {}, amount: {} {}", destination, request.getAmount(), request.getCurrency());

        if (destination == null || destination.trim().isEmpty()) {
            return PaymentResponse.builder()
                    .paymentId(UUID.randomUUID())
                    .status(PaymentStatus.FAILED)
                    .transactionReference("BT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.BANK_TRANSFER)
                    .provider(PaymentProvider.STRIPE)
                    .message("Aucun compte de destination fourni")
                    .success(false)
                    .token(null)
                    .build();
        }

        var gateway = gatewayFactory.getActiveGateway()
                .orElseThrow(() -> new IllegalStateException("No payment gateway available"));

        String description = "Virement bancaire vers " + destination;
        GatewayChargeResult chargeResult = gateway.charge(destination, request.getAmount(), request.getCurrency(), description);

        PaymentResponse response = PaymentResponse.builder()
                .paymentId(UUID.randomUUID())
                .status(chargeResult.success() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED)
                .transactionReference("BT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .externalTransactionId(chargeResult.externalId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.BANK_TRANSFER)
                .provider(request.getProvider() != null ? request.getProvider() : gateway.getProvider())
                .message(chargeResult.message())
                .success(chargeResult.success())
                .token(null)
                .build();

        User user = currentUserService.getCurrentUser();
        String senderName = user.getFirstName() + " " + user.getLastName();
        String providerLabel = gateway.getProvider() != null
                ? gateway.getProvider().getDisplayName()
                : "Virement bancaire";
        notificationService.sendPaymentNotification(
                user.getEmail(), senderName, providerLabel,
                request.getAmount().toString(), request.getCurrency(),
                response.getMessage(), null);

        if (response.isSuccess()) {
            accountRepository.findByAccountNumber(destination).ifPresent(receiverAccount -> {
                User receiver = receiverAccount.getUser();
                notificationService.sendPaymentReceivedNotification(
                        receiver.getEmail(), null, senderName,
                        request.getAmount().toString(), request.getCurrency(),
                        response.getTransactionReference());
                log.info("Sent payment received notification to: {}", receiver.getEmail());
            });
        }

        return response;
    }
}
