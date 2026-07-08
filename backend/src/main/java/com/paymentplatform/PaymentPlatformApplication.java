package com.paymentplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PaymentPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentPlatformApplication.class, args);
    }
}
