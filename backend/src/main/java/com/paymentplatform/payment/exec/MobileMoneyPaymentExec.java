package com.paymentplatform.payment.exec;

import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.wallet.service.WalletService;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.MobileMoneyOperator;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.gateway.GatewayChargeResult;
import com.paymentplatform.payment.gateway.MTNMobileMoneyGateway;
import com.paymentplatform.payment.gateway.MPesaGateway;
import com.paymentplatform.payment.gateway.OrangeMoneyGateway;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class MobileMoneyPaymentExec implements PaymentExec {

    private final OrangeMoneyGateway orangeMoneyGateway;
    private final MTNMobileMoneyGateway mtnMobileMoneyGateway;
    private final MPesaGateway mpesaGateway;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final LedgerService ledgerService;
    private final WalletService walletService;
    private final AccountRepository accountRepository;

    @Override
    public PaymentResponse execute(PaymentRequest request) {
        try {
            String phone = request.getMobileMoneyPhone();
            MobileMoneyOperator operator = request.getMobileMoneyOperator();

            if (!currentUserService.isCurrentUserEnabled()) {
                return PaymentResponse.builder()
                        .paymentId(UUID.randomUUID())
                        .status(PaymentStatus.FAILED)
                        .transactionReference("MM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .externalTransactionId(null)
                        .amount(request.getAmount())
                        .currency(request.getCurrency())
                        .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.MOBILE_MONEY)
                        .provider(null)
                        .message("Votre compte n'est pas encore activé. Veuillez contacter l'administration.")
                        .success(false)
                        .token(null)
                        .build();
            }

            log.info("Initiating mobile money payment for phone: {}, operator: {}", phone,
                    operator != null ? operator.getDisplayName() : "UNKNOWN");

            String description = "Paiement Mobile Money - " + phone + " - " + request.getAmount() + " " + request.getCurrency();

            PaymentProvider provider = resolveProvider(operator);

            GatewayChargeResult chargeResult;
            try {
                if (provider == PaymentProvider.ORANGE_MONEY) {
                    chargeResult = orangeMoneyGateway.charge(phone, request.getAmount(), request.getCurrency(), description);
                } else if (provider == PaymentProvider.MTN_MOBILE_MONEY) {
                    chargeResult = mtnMobileMoneyGateway.charge(phone, request.getAmount(), request.getCurrency(), description);
                } else if (provider == PaymentProvider.MPESA) {
                    chargeResult = mpesaGateway.charge(phone, request.getAmount(), request.getCurrency(), description);
                } else {
                    chargeResult = simulatePush(phone, operator);
                }
            } catch (Exception ex) {
                log.error("Mobile money gateway charge failed", ex);
                return PaymentResponse.builder()
                        .paymentId(UUID.randomUUID())
                        .status(PaymentStatus.FAILED)
                        .transactionReference("MM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .externalTransactionId(null)
                        .amount(request.getAmount())
                        .currency(request.getCurrency())
                        .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.MOBILE_MONEY)
                        .provider(provider)
                        .message("Échec du traitement Mobile Money. Veuillez réessayer.")
                        .success(false)
                        .token(null)
                        .build();
            }

            PaymentStatus status = chargeResult.success() ? PaymentStatus.PENDING : PaymentStatus.FAILED;

            PaymentResponse response = PaymentResponse.builder()
                    .paymentId(UUID.randomUUID())
                    .status(status)
                    .transactionReference("MM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .externalTransactionId(chargeResult.externalId())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.MOBILE_MONEY)
                    .provider(provider)
                    .message(chargeResult.message())
                    .success(chargeResult.success())
                    .token(null)
                    .build();

            User user = currentUserService.getCurrentUser();

            if (chargeResult.success()) {
                try {
                    UUID txnId = UUID.nameUUIDFromBytes(response.getTransactionReference().getBytes());
                    Account userAccount = accountRepository.findByUserId(user.getId())
                            .orElseThrow(() -> new IllegalStateException("Account not found for user"));
                    walletService.withdraw(currentUserService.getCurrentUserId(), currentUserService.isCurrentUserAdmin(),
                            userAccount.getId(), new java.math.BigDecimal(request.getAmount().toString()),
                            "Paiement Mobile Money - " + response.getTransactionReference());
                    ledgerService.saveEntries(List.of(
                            LedgerEntry.builder()
                                    .transactionId(txnId)
                                    .accountId(userAccount.getId())
                                    .entryType(LedgerEntry.EntryType.DEBIT)
                                    .amount(new java.math.BigDecimal(request.getAmount().toString()))
                                    .currency(request.getCurrency())
                                    .build()
                    ));
                } catch (Exception ex) {
                    log.error("Wallet/ledger update failed after successful mobile money charge", ex);
                    return PaymentResponse.builder()
                            .paymentId(response.getPaymentId())
                            .status(PaymentStatus.FAILED)
                            .transactionReference(response.getTransactionReference())
                            .externalTransactionId(chargeResult.externalId())
                            .amount(request.getAmount())
                            .currency(request.getCurrency())
                            .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.MOBILE_MONEY)
                            .provider(provider)
                            .message("Paiement accepté par l'opérateur, mais la mise à jour du compte a échoué. Contactez le support.")
                            .success(false)
                            .token(null)
                            .build();
                }
            }

            try {
                String providerLabel = operator != null ? operator.getDisplayName() : "Mobile Money";
                notificationService.sendPaymentNotification(
                        user.getEmail(), user.getFirstName(), providerLabel,
                        request.getAmount().toString(), request.getCurrency(),
                        response.getMessage(), null);
            } catch (Exception ex) {
                log.warn("Notification failed for mobile money payment", ex);
            }

            return response;
        } catch (Exception ex) {
            log.error("Unhandled mobile money payment error", ex);
            return PaymentResponse.builder()
                    .paymentId(UUID.randomUUID())
                    .status(PaymentStatus.FAILED)
                    .transactionReference("MM-ERROR")
                    .externalTransactionId(null)
                    .amount(request != null ? request.getAmount() : 0)
                    .currency(request != null ? request.getCurrency() : "MGA")
                    .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.MOBILE_MONEY)
                    .provider(null)
                    .message("Une erreur interne est survenue lors du paiement Mobile Money. Veuillez réessayer.")
                    .success(false)
                    .token(null)
                    .build();
        }
    }

    private GatewayChargeResult simulatePush(String phone, MobileMoneyOperator operator) {
        if (phone == null || phone.trim().isEmpty()) {
            log.warn("Mobile Money payment attempted without phone number");
            return new GatewayChargeResult(false, null,
                    "Aucun numéro de téléphone fourni", "invalid_phone");
        }
        log.info("USSD push sent to {} via {}", phone, operator != null ? operator.getDisplayName() : "Unknown provider");
        return new GatewayChargeResult(true, "sim-" + System.nanoTime(),
                "USSD push envoyé au " + phone + ". Veuillez saisir le code OTP sur votre téléphone pour confirmer.",
                null);
    }

    private PaymentProvider resolveProvider(MobileMoneyOperator operator) {
        if (operator == null) return PaymentProvider.ORANGE_MONEY;
        return switch (operator) {
            case ORANGE_MONEY_CI -> PaymentProvider.ORANGE_MONEY;
            case MTN_MOBILE_MONEY -> PaymentProvider.MTN_MOBILE_MONEY;
            case MPESA_KENYA, MPESA_TANZANIA, VODACOM_MPESA -> PaymentProvider.MPESA;
        };
    }
}
