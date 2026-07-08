package com.paymentplatform.operator;

public class OperatorResponse {
    private boolean success;
    private String externalId;
    private String message;

    public OperatorResponse() {}

    public OperatorResponse(boolean success, String externalId, String message) {
        this.success = success;
        this.externalId = externalId;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getExternalId() {
        return externalId;
    }

    public void setExternalId(String externalId) {
        this.externalId = externalId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
