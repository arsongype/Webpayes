package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.CreateOrderRequest;
import com.ecommerce.backend.dto.OrderResponse;
import com.ecommerce.backend.dto.UpdateOrderStatusRequest;
import com.ecommerce.backend.entity.Order;
import com.ecommerce.backend.entity.OrderItem;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.enums.OrderStatus;
import com.ecommerce.backend.exception.ApiException;
import com.ecommerce.backend.mapper.EntityMapper;
import com.ecommerce.backend.repository.OrderRepository;
import com.ecommerce.backend.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EntityMapper mapper;
    private final AuthService authService;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        User user = authService.getAuthenticatedUser();

        Order order = Order.builder()
                .orderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .user(user)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(request.totalAmount())
                .shippingAddress(mapper.toShippingAddress(request.shippingAddress()))
                .build();

        for (var itemRequest : request.items()) {
            Product product = productRepository.findById(itemRequest.productId()).orElse(null);
            String name = itemRequest.name() != null ? itemRequest.name()
                    : product != null ? product.getName() : "Produit";
            String imageUrl = itemRequest.imageUrl() != null ? itemRequest.imageUrl()
                    : product != null ? product.getImageUrl() : null;

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .productName(name)
                    .productImageUrl(imageUrl)
                    .quantity(itemRequest.quantity())
                    .unitPrice(itemRequest.price())
                    .build();

            order.addItem(item);

            if (product != null && product.getStockQuantity() != null) {
                product.setStockQuantity(Math.max(0, product.getStockQuantity() - itemRequest.quantity()));
                productRepository.save(product);
            }
        }

        return mapper.toOrderResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getUserOrders() {
        User user = authService.getAuthenticatedUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(mapper::toOrderResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        User user = authService.getAuthenticatedUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException("Commande non trouvée", 404));
        return mapper.toOrderResponse(order);
    }

    public OrderResponse getOrderByNumber(String orderNumber) {
        User user = authService.getAuthenticatedUser();
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ApiException("Commande non trouvée", 404));

        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != com.ecommerce.backend.enums.Role.ADMIN) {
            throw new ApiException("Accès refusé", 403);
        }

        return mapper.toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id) {
        User user = authService.getAuthenticatedUser();
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ApiException("Commande non trouvée", 404));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ApiException("Cette commande ne peut pas être annulée", 400);
        }

        order.setStatus(OrderStatus.CANCELLED);
        return mapper.toOrderResponse(orderRepository.save(order));
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(mapper::toOrderResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Commande non trouvée", 404));
        order.setStatus(request.status());
        return mapper.toOrderResponse(orderRepository.save(order));
    }
}
