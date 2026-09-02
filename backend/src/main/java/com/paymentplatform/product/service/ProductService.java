package com.paymentplatform.product.service;

import com.paymentplatform.common.exception.BusinessException;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.product.dto.ProductDTO;
import com.paymentplatform.product.dto.ProductRequestDTO;
import com.paymentplatform.product.entity.Product;
import com.paymentplatform.product.repository.ProductRepository;
import com.paymentplatform.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final MerchantProfileRepository merchantProfileRepository;
    private final CurrentUserService currentUserService;

    public Page<ProductDTO> listPublic(String query, Pageable pageable) {
        if (query != null && !query.isBlank()) {
            return productRepository.findByActiveTrue(Pageable.ofSize(100)).stream()
                    .filter(p -> p.getName().toLowerCase().contains(query.toLowerCase()))
                    .map(this::toDto)
                    .collect(Collectors.toList())
                    .stream()
                    .collect(Collectors.toList())
                    .stream()
                    .collect(java.util.stream.Collectors.collectingAndThen(java.util.stream.Collectors.toList(), list -> {
                        List<ProductDTO> dtos = list;
                        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, dtos.size());
                    }));
        }
        return productRepository.findByActiveTrue(pageable).map(this::toDto);
    }

    public Page<ProductDTO> listMyProducts(Pageable pageable) {
        UUID userId = currentUserService.getCurrentUserId();
        return productRepository.findByActiveTrueAndMerchant_Id(userId, pageable).map(this::toDto);
    }

    public List<ProductDTO> listMyProductsAll() {
        UUID userId = currentUserService.getCurrentUserId();
        return productRepository.findByMerchant_Id(userId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public ProductDTO getById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Produit introuvable", HttpStatus.NOT_FOUND));
        return toDto(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        MerchantProfile merchant = merchantProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException("Profil marchand introuvable", HttpStatus.BAD_REQUEST));

        Product product = Product.builder()
                .merchant(merchant)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "MGA")
                .imageUrl(request.getImageUrl())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toDto(productRepository.save(product));
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, ProductRequestDTO request) {
        UUID userId = currentUserService.getCurrentUserId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Produit introuvable", HttpStatus.NOT_FOUND));

        if (!product.getMerchant().getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        if (request.getName() != null) product.setName(request.getName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getCurrency() != null) product.setCurrency(request.getCurrency());
        if (request.getImageUrl() != null) product.setImageUrl(request.getImageUrl());
        if (request.getStock() != null) product.setStock(request.getStock());
        if (request.getActive() != null) product.setActive(request.getActive());

        return toDto(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(UUID id) {
        UUID userId = currentUserService.getCurrentUserId();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Produit introuvable", HttpStatus.NOT_FOUND));

        if (!product.getMerchant().getUser().getId().equals(userId)) {
            throw new BusinessException("Accès refusé", HttpStatus.FORBIDDEN);
        }

        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDTO toDto(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .merchantId(product.getMerchant().getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .currency(product.getCurrency())
                .imageUrl(product.getImageUrl())
                .stock(product.getStock())
                .active(product.getActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
