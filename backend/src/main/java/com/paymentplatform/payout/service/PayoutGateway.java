package com.paymentplatform.payout.service;

import com.paymentplatform.payout.entity.Payout;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

public class PayoutGateway {

    public static PayoutResult executeBankTransfer(Payout payout) {
        if (payout.getIban() == null || payout.getIban().isBlank()) {
            return PayoutResult.failed("IBAN invalide");
        }
        if (payout.getAmount().compareTo(new BigDecimal("10000")) > 0) {
            return PayoutResult.failed("Montant supérieur au plafond journalier (10 000 €)");
        }
        String externalId = "SEPA-" + System.currentTimeMillis();
        return PayoutResult.success(externalId, "Virement SEPA émis via " + payout.getBic());
    }

    public static PayoutResult executeMobileMoney(Payout payout) {
        String phone = payout.getDestinationReference();
        if (phone == null || phone.length() < 8) {
            return PayoutResult.failed("Numéro de téléphone invalide");
        }
        String externalId = "MM-" + System.currentTimeMillis();
        return PayoutResult.success(externalId, "Push USSD envoyé au " + phone);
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayoutResult {
        private boolean success;
        private String externalId;
        private String message;

        public static PayoutResult success(String externalId, String message) {
            return new PayoutResult(true, externalId, message);
        }

        public static PayoutResult failed(String message) {
            return new PayoutResult(false, null, message);
        }
    }
}
