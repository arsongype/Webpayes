package com.paymentplatform.payment.enums;

public enum MobileMoneyOperator {
    ORANGE_MONEY_CI("Orange Money", "+225"),
    MTN_MOBILE_MONEY("MTN Mobile Money", "+225"),
    MPESA_KENYA("M-Pesa", "+254"),
    MPESA_TANZANIA("M-Pesa", "+255"),
    VODACOM_MPESA("M-Pesa", "+255");

    private final String displayName;
    private final String countryCallingCode;

    MobileMoneyOperator(String displayName, String countryCallingCode) {
        this.displayName = displayName;
        this.countryCallingCode = countryCallingCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCountryCallingCode() {
        return countryCallingCode;
    }
}
