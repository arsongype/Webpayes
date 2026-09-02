package com.paymentplatform.payment.exec;

import com.paymentplatform.aiclient.FraudDetectionClient;
import com.paymentplatform.aiclient.FraudDetectionRequest;
import com.paymentplatform.aiclient.FraudDetectionResponse;
import com.paymentplatform.aiclient.RoutingClient;
import com.paymentplatform.aiclient.RoutingRequest;
import com.paymentplatform.aiclient.RoutingResponse;
import com.paymentplatform.aiclient.*;
import com.paymentplatform.notification.service.NotificationService;
import com.paymentplatform.ledger.entity.LedgerEntry;
import com.paymentplatform.ledger.service.LedgerService;
import com.paymentplatform.wallet.service.WalletService;
import com.paymentplatform.account.repository.AccountRepository;
import com.paymentplatform.account.entity.Account;
import com.paymentplatform.payment.dto.PaymentRequest;
import com.paymentplatform.payment.dto.PaymentResponse;
import com.paymentplatform.payment.enums.PaymentProvider;
import com.paymentplatform.payment.enums.PaymentStatus;
import com.paymentplatform.payment.gateway.GatewayChargeResult;
import com.paymentplatform.payment.gateway.PaymentGateway;
import com.paymentplatform.payment.gateway.PaymentGatewayFactory;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import com.paymentplatform.vault.dto.DetokenizeRequest;
import com.paymentplatform.vault.service.VaultService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CardPaymentExec implements PaymentExec {

    private final VaultService vaultService;
    private final PaymentGatewayFactory gatewayFactory;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;
    private final FraudDetectionClient fraudDetectionClient;
    private final RoutingClient routingClient;
    private final ExemptionClient exemptionClient;
    private final LedgerService ledgerService;
    private final WalletService walletService;
    private final AccountRepository accountRepository;

    @Value("${payment.fraud.block-threshold:0.8}")
    private double fraudBlockThreshold;

    @Value("${payment.fraud.challenge-threshold:0.5}")
    private double fraudChallengeThreshold;

    @Override
    public PaymentResponse execute(PaymentRequest request) {
        UUID transactionId = UUID.randomUUID();
        String transactionRef = "CARD-" + transactionId.toString().substring(0, 8).toUpperCase();

        DetokenizeRequest detokenizeRequest = DetokenizeRequest.builder()
                .token(request.getToken())
                .build();
        var detokenizeResponse = vaultService.detokenize(detokenizeRequest);

        String cardHolderName = request.getCardHolderName() != null
                ? request.getCardHolderName() : "Client";

        User user = currentUserService.getCurrentUser();
        String senderAccountId = user.getId().toString();

        FraudDetectionRequest fraudRequest = FraudDetectionRequest.builder()
                .transactionId(transactionRef)
                .amount(BigDecimal.valueOf(request.getAmount()))
                .currency(request.getCurrency())
                .senderAccountId(senderAccountId)
                .receiverAccountId(request.getProvider() != null ? request.getProvider().name() : "UNKNOWN")
                .metadata(Map.of(
                        "cardHolderName", cardHolderName,
                        "paymentMethod", request.getPaymentMethod().name(),
                        "source", "CARD"
                ))
                .build();

        FraudDetectionResponse fraudResponse = fraudDetectionClient.analyze(fraudRequest);
        double fraudScore = fraudResponse.getFraudScore();
        String riskLevel = fraudResponse.getRiskLevel();
        String recommendation = fraudResponse.getRecommendation();

        log.info("Fraud check: {} score={}, risk={}, rec={}", transactionRef, fraudScore, riskLevel, recommendation);
        log.info("Fraud details: {}", fraudResponse.getDetails());

        if (fraudScore >= fraudBlockThreshold || fraudResponse.isFraudulent()) {
            log.warn("Payment blocked by fraud detection: {} (score={})", transactionRef, fraudScore);
            return PaymentResponse.builder()
                    .paymentId(transactionId)
                    .status(PaymentStatus.FAILED)
                    .transactionReference(transactionRef)
                    .externalTransactionId(null)
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.CARD)
                    .provider(request.getProvider())
                    .message("Paiement bloqué par détection de fraude. Veuillez contacter le support.")
                    .success(false)
                    .token(request.getToken())
                    .riskScore(fraudScore)
                    .riskLevel(riskLevel)
                    .threeDsRequired(false)
                    .fraudRecommendation(recommendation)
                    .build();
        }

        boolean needs3ds = fraudScore >= fraudChallengeThreshold;

        // US02.5: Evaluate 3DS2 TRA exemption for 1-click payments
        boolean isOneClick = request.getThreeDsAuthCode() != null && !request.getThreeDsAuthCode().isEmpty();
        boolean previousSuccess = request.getPreviousTransactionId() != null && !request.getPreviousTransactionId().isEmpty();

        if (needs3ds && isOneClick) {
            ExemptionRequest exemptionRequest = ExemptionRequest.builder()
                    .transactionId(transactionRef)
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .senderAccountId(senderAccountId)
                    .receiverAccountId(gatewayFactory.getActiveGateway()
                            .map(g -> g.getProvider().name())
                            .orElse("UNKNOWN"))
                    .isOneClick(isOneClick)
                    .previousTransactionSuccess(previousSuccess)
                    .previousTransactionId(request.getPreviousTransactionId())
                    .fraudScore(fraudScore)
                    .build();

            ExemptionResponse exemption = exemptionClient.evaluateExemption(exemptionRequest);
            if (exemption.isExemptionGranted()) {
                needs3ds = false;
                log.info("3DS2 TRA exemption granted for {}: {}", transactionRef, exemption.getExemptionType());
            }
        }

        RoutingRequest routingRequest = RoutingRequest.builder()
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .sender_country("CI")
                .receiver_country(request.getProvider() != null ? "GLOBAL" : "GLOBAL")
                .urgency_seconds(30)
                .preferred_channel(request.getProvider() != null ? request.getProvider().name() : null)
                .build();

        RoutingResponse routingResponse = routingClient.getBestChannel(routingRequest);
        PaymentGateway gateway;
        if (routingResponse != null && routingResponse.getRecommended_channel() != null) {
            String recommended = routingResponse.getRecommended_channel();
            gateway = gatewayFactory.byProvider(safeParseProvider(recommended))
                    .orElseGet(() -> gatewayFactory.getActiveGateway()
                            .orElseThrow(() -> new IllegalStateException("No payment gateway available")));
            log.info("Routing: recommended channel={}, using gateway={}", recommended, gateway.getProvider());
        } else {
            gateway = gatewayFactory.byProvider(request.getProvider())
                    .orElseGet(() -> gatewayFactory.getActiveGateway()
                            .orElseThrow(() -> new IllegalStateException("No payment gateway available")));
        }

        String description = "Paiement par carte - " + cardHolderName + " - " + request.getAmount() + " " + request.getCurrency();
        GatewayChargeResult chargeResult;
        if (needs3ds) {
            chargeResult = gateway.chargeWith3ds(request.getToken(), request.getAmount(), request.getCurrency(), description);
            log.info("3DS2 challenge required for transaction {}", transactionRef);
        } else {
            chargeResult = gateway.charge(request.getToken(), request.getAmount(), request.getCurrency(), description);
        }

        PaymentStatus status = chargeResult.success() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        PaymentResponse response = PaymentResponse.builder()
                .paymentId(transactionId)
                .status(status)
                .transactionReference(transactionRef)
                .externalTransactionId(chargeResult.externalId())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .paymentMethod(com.paymentplatform.payment.enums.PaymentMethodType.CARD)
                .provider(request.getProvider() != null ? request.getProvider() : gateway.getProvider())
                .message(chargeResult.message())
                .success(chargeResult.success())
                .token(request.getToken())
                .riskScore(fraudScore)
                .riskLevel(riskLevel)
                .threeDsRequired(needs3ds)
                .fraudRecommendation(recommendation)
                .build();

        if (chargeResult.success()) {
            Account userAccount = accountRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new IllegalStateException("Account not found for user"));
            walletService.deposit(currentUserService.getCurrentUserId(), currentUserService.isCurrentUserAdmin(),
                    userAccount.getId(), BigDecimal.valueOf(request.getAmount()),
                    "Paiement par carte - " + transactionRef);
            ledgerService.saveEntries(List.of(
                    LedgerEntry.builder()
                            .transactionId(transactionId)
                            .accountId(userAccount.getId())
                            .entryType(LedgerEntry.EntryType.CREDIT)
                            .amount(BigDecimal.valueOf(request.getAmount()))
                            .currency(request.getCurrency())
                            .build(),
                    LedgerEntry.builder()
                            .transactionId(transactionId)
                            .accountId(userAccount.getId())
                            .entryType(LedgerEntry.EntryType.DEBIT)
                            .amount(BigDecimal.valueOf(request.getAmount()))
                            .currency(request.getCurrency())
                            .build()
            ));
        }

        String providerLabel = gateway.getProvider() != null
                ? gateway.getProvider().getDisplayName()
                : "Carte bancaire";
        notificationService.sendPaymentNotification(
                user.getEmail(), user.getFirstName() + " " + user.getLastName(), providerLabel,
                request.getAmount().toString(), request.getCurrency(),
                response.getMessage(), null);

        return response;
    }

    private PaymentProvider safeParseProvider(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return PaymentProvider.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}


