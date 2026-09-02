package com.paymentplatform.payment.enums;

public enum PaymentProvider {
    STRIPE("Stripe"),
    ADYEN("Adyen"),
    ORANGE_MONEY("Orange Money"),
    MTN_MOBILE_MONEY("MTN Mobile Money"),
    MPESA("M-Pesa"),
    VISA("Visa"),
    MASTERCARD("Mastercard");

    private final String displayName;

    PaymentProvider(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
