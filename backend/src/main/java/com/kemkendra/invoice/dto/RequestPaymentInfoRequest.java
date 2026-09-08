package com.kemkendra.invoice.dto;

import jakarta.validation.constraints.NotBlank;

public class RequestPaymentInfoRequest {

    @NotBlank(message = "Message detailing required information is required")
    private String message;

    public RequestPaymentInfoRequest() {}

    public RequestPaymentInfoRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
