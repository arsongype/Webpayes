package com.paymentplatform.order.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.order.dto.OrderDTO;
import com.paymentplatform.order.dto.OrderRequestDTO;
import com.paymentplatform.order.entity.Order;
import com.paymentplatform.order.entity.Order.OrderStatus;
import com.paymentplatform.order.repository.OrderRepository;
import com.paymentplatform.product.entity.Product;
import com.paymentplatform.product.repository.ProductRepository;
import com.paymentplatform.security.CurrentUserService;
import com.paymentplatform.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public List<OrderDTO> listMyOrders() {
        UUID buyerId = currentUserService.getCurrentUserId();
        return orderRepository.findByBuyer_Id(buyerId, org.springframework.data.domain.PageRequest.of(0, 100))
                .getContent().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<OrderDTO> listMerchantOrders() {
        UUID merchantUserId = currentUserService.getCurrentUserId();
        return orderRepository.findByProduct_Merchant_Id(merchantUserId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO createOrder(OrderRequestDTO request) {
        UUID buyerId = currentUserService.getCurrentUserId();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Produit introuvable", HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new BusinessException("Produit indisponible", HttpStatus.BAD_REQUEST);
        }

        if (product.getStock() < request.getQuantity()) {
            throw new BusinessException("Stock insuffisant", HttpStatus.BAD_REQUEST);
        }

        User buyer = currentUserService.getCurrentUser();
        BigDecimal total = product.getPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = Order.builder()
                .buyer(buyer)
                .product(product)
                .quantity(request.getQuantity())
                .totalAmount(total)
                .currency(product.getCurrency())
                .status(OrderStatus.PENDING)
                .paymentReference(request.getPaymentReference())
                .build();

        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        Order saved = orderRepository.save(order);
        return toDto(saved);
    }

    @Transactional
    public OrderDTO markAsPaid(UUID id) {
        UUID merchantUserId = currentUserService.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Commande introuvable", HttpStatus.NOT_FOUND));

        if (!order.getProduct().getMerchant().getUser().getId().equals(merchantUserId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        order.setStatus(OrderStatus.PAID);
        return toDto(orderRepository.save(order));
    }

    @Transactional
    public OrderDTO cancel(UUID id) {
        UUID buyerId = currentUserService.getCurrentUserId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Commande introuvable", HttpStatus.NOT_FOUND));

        if (!order.getBuyer().getId().equals(buyerId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException("Impossible d'annuler cette commande", HttpStatus.BAD_REQUEST);
        }

        order.setStatus(OrderStatus.CANCELLED);
        Product product = order.getProduct();
        product.setStock(product.getStock() + order.getQuantity());
        productRepository.save(product);

        return toDto(orderRepository.save(order));
    }

    private OrderDTO toDto(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .buyerId(order.getBuyer().getId())
                .buyerName(order.getBuyer().getFirstName() + " " + order.getBuyer().getLastName())
                .productId(order.getProduct().getId())
                .productName(order.getProduct().getName())
                .quantity(order.getQuantity())
                .totalAmount(order.getTotalAmount())
                .currency(order.getCurrency())
                .status(order.getStatus().name())
                .paymentReference(order.getPaymentReference())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
