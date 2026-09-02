package com.paymentplatform.payment.enums;

public enum PaymentMethodType {
    CARD("Carte bancaire"),
    MOBILE_MONEY("Mobile Money"),
    BANK_TRANSFER("Virement bancaire");

    private final String displayName;

    PaymentMethodType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
