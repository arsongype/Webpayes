package com.paymentplatform.payment.exec;

import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.wallet.service.WalletService;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.gateway.GatewayChargeResult;
import com.paymentplatform.payment.gateway.PaymentGatewayFactory;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BankTransferExec implements PaymentExec {

    private final PaymentGatewayFactory gatewayFactory;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final AccountRepository accountRepository;
    private final WalletService walletService;
    private final LedgerService ledgerService;

    @Override
    public PaymentResponse execute(PaymentRequest request) {
        try {
            String destination = request.getDestinationAccount();
            log.info("Initiating bank transfer to account: {}, amount: {} {}", destination, request.getAmount(), request.getCurrency());

            if (!currentUserService.isCurrentUserEnabled()) {
                return PaymentResponse.builder()
                        .paymentId(UUID.randomUUID())
                        .status(PaymentStatus.FAILED)
                        .transactionReference("BT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .amount(request.getAmount())
                        .currency(request.getCurrency())
                        .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.BANK_TRANSFER)
                        .provider(PaymentProvider.STRIPE)
                        .message("Votre compte n'est pas encore activé. Veuillez contacter l'administration.")
                        .success(false)
                        .token(null)
                        .build();
            }

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
                try {
                    Account senderAccount = accountRepository.findByUserId(currentUserService.getCurrentUserId())
                            .orElseThrow(() -> new IllegalStateException("Account not found for sender"));
                    walletService.withdraw(currentUserService.getCurrentUserId(), currentUserService.isCurrentUserAdmin(),
                            senderAccount.getId(), BigDecimal.valueOf(request.getAmount()),
                            "Virement vers " + destination);

                    UUID txnId = UUID.nameUUIDFromBytes(response.getTransactionReference().getBytes());
                    ledgerService.saveEntries(List.of(
                            LedgerEntry.builder()
                                    .transactionId(txnId)
                                    .accountId(senderAccount.getId())
                                    .entryType(LedgerEntry.EntryType.DEBIT)
                                    .amount(BigDecimal.valueOf(request.getAmount()))
                                    .currency(request.getCurrency())
                                    .build()
                    ));

                    accountRepository.findByAccountNumber(destination).ifPresent(receiverAccount -> {
                        walletService.deposit(receiverAccount.getUser().getId(), true,
                                receiverAccount.getId(), BigDecimal.valueOf(request.getAmount()),
                                "Virement depuis " + senderAccount.getAccountNumber());
                        ledgerService.saveEntries(List.of(
                                LedgerEntry.builder()
                                        .transactionId(txnId)
                                        .accountId(receiverAccount.getId())
                                        .entryType(LedgerEntry.EntryType.CREDIT)
                                        .amount(BigDecimal.valueOf(request.getAmount()))
                                        .currency(request.getCurrency())
                                        .build()
                        ));
                        User receiver = receiverAccount.getUser();
                        try {
                            notificationService.sendPaymentReceivedNotification(
                                    receiver.getEmail(), null, senderName,
                                    request.getAmount().toString(), request.getCurrency(),
                                    response.getTransactionReference());
                        } catch (Exception ex) {
                            log.warn("Payment received notification failed for {}", receiver.getEmail(), ex);
                        }
                        log.info("Sent payment received notification to: {}", receiver.getEmail());
                    });
                } catch (Exception ex) {
                    log.error("Wallet/ledger update failed after successful bank transfer", ex);
                    return PaymentResponse.builder()
                            .paymentId(response.getPaymentId())
                            .status(PaymentStatus.FAILED)
                            .transactionReference(response.getTransactionReference())
                            .externalTransactionId(chargeResult.externalId())
                            .amount(request.getAmount())
                            .currency(request.getCurrency())
                            .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.BANK_TRANSFER)
                            .provider(request.getProvider() != null ? request.getProvider() : gateway.getProvider())
                            .message("Virement accepté, mais la mise à jour du compte a échoué. Contactez le support.")
                            .success(false)
                            .token(null)
                            .build();
                }
            }

            return response;
        } catch (Exception ex) {
            log.error("Unhandled bank transfer error", ex);
            return PaymentResponse.builder()
                    .paymentId(UUID.randomUUID())
                    .status(PaymentStatus.FAILED)
                    .transactionReference("BT-ERROR")
                    .externalTransactionId(null)
                    .amount(request != null ? request.getAmount() : 0)
                    .currency(request != null ? request.getCurrency() : "MGA")
                    .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.BANK_TRANSFER)
                    .provider(null)
                    .message("Une erreur interne est survenue lors du virement. Veuillez réessayer.")
                    .success(false)
                    .token(null)
                    .build();
        }
    }
}
