package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<OrderResponse> getUserOrders() {
        return orderService.getUserOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @GetMapping("/number/{orderNumber}")
    public OrderResponse getByNumber(@PathVariable String orderNumber) {
        return orderService.getOrderByNumber(orderNumber);
    }

    @PutMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }
}
