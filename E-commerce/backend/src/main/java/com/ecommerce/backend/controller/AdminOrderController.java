package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.UpdateOrderStatusRequest;
import com.ecommerce.backend.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public Page<OrderResponse> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return orderService.getAllOrders(page, size);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody UpdateOrderStatusRequest request) {
        return orderService.updateOrderStatus(id, request);
    }
}
