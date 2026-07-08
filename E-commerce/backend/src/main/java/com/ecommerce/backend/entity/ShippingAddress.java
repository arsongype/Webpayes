package com.ecommerce.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {

    @Column(name = "shipping_first_name")
    private String firstName;

    @Column(name = "shipping_last_name")
    private String lastName;

    @Column(name = "shipping_email")
    private String email;

    @Column(name = "shipping_phone")
    private String phone;

    @Column(name = "shipping_address")
    private String address;

    @Column(name = "shipping_city")
    private String city;

    @Column(name = "shipping_postal_code")
    private String postalCode;

    @Column(name = "shipping_country")
    private String country;
}
