package com.paymentplatform.order.controller;

import com.paymentplatform.order.dto.OrderDTO;
import com.paymentplatform.order.dto.OrderRequestDTO;
import com.paymentplatform.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/my")
    public ResponseEntity<List<OrderDTO>> listMyOrders() {
        return ResponseEntity.ok(orderService.listMyOrders());
    }

    @GetMapping("/merchant")
    public ResponseEntity<List<OrderDTO>> listMerchantOrders() {
        return ResponseEntity.ok(orderService.listMerchantOrders());
    }

    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderRequestDTO request) {
        return ResponseEntity.ok(orderService.createOrder(request));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<OrderDTO> markAsPaid(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.markAsPaid(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<OrderDTO> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.cancel(id));
    }
}
