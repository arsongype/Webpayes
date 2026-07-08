package com.ecommerce.backend.mapper;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EntityMapper {

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getRole(),
                user.getCreatedAt()
        );
    }

    public CategoryResponse toCategoryResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getSlug());
    }

    public ProductResponse toProductResponse(Product product) {
        List<String> images = product.getImages() != null && !product.getImages().isEmpty()
                ? product.getImages()
                : product.getImageUrl() != null ? List.of(product.getImageUrl()) : List.of();

        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getSku(),
                product.getImageUrl(),
                images,
                product.getCategory() != null ? toCategoryResponse(product.getCategory()) : null,
                product.getStockQuantity(),
                product.getRating(),
                product.getReviewCount(),
                product.getIsNew(),
                product.getFeatured(),
                product.getCreatedAt()
        );
    }

    public ShippingAddressDto toShippingAddressDto(ShippingAddress address) {
        if (address == null) return null;
        return new ShippingAddressDto(
                address.getFirstName(),
                address.getLastName(),
                address.getEmail(),
                address.getPhone(),
                address.getAddress(),
                address.getCity(),
                address.getPostalCode(),
                address.getCountry()
        );
    }

    public ShippingAddress toShippingAddress(ShippingAddressDto dto) {
        return ShippingAddress.builder()
                .firstName(dto.firstName())
                .lastName(dto.lastName())
                .email(dto.email())
                .phone(dto.phone())
                .address(dto.address())
                .city(dto.city())
                .postalCode(dto.postalCode())
                .country(dto.country())
                .build();
    }

    public OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> items = new ArrayList<>();
        for (OrderItem item : order.getItems()) {
            items.add(new OrderItemResponse(
                    item.getProduct() != null ? item.getProduct().getId() : null,
                    item.getProductName(),
                    item.getProductImageUrl(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getUnitPrice(),
                    new OrderItemResponse.ProductSummary(item.getProductName(), item.getProductImageUrl())
            ));
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getUser().getId(),
                order.getStatus(),
                order.getTotalAmount(),
                toShippingAddressDto(order.getShippingAddress()),
                items,
                order.getCreatedAt()
        );
    }

    public ReviewResponse toReviewResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getUser().getFirstName() + " " + review.getUser().getLastName(),
                review.getCreatedAt()
        );
    }
}
