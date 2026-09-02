package com.paymentplatform.product.controller;

import com.paymentplatform.common.constants.Role;
import com.paymentplatform.merchantprofile.entity.MerchantProfile;
import com.paymentplatform.merchantprofile.entity.MerchantProfileStatus;
import com.paymentplatform.merchantprofile.repository.MerchantProfileRepository;
import com.paymentplatform.product.dto.ProductDTO;
import com.paymentplatform.product.dto.ProductRequestDTO;
import com.paymentplatform.product.service.ProductService;
import com.paymentplatform.security.CurrentUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final CurrentUserService currentUserService;
    private final MerchantProfileRepository merchantProfileRepository;

    private boolean isAuthorized() {
        if (currentUserService.isCurrentUserAdmin()) {
            return true;
        }
        UUID userId = currentUserService.getCurrentUserId();
        return merchantProfileRepository.findByUserId(userId)
                .map(p -> p.getStatus() == MerchantProfileStatus.APPROVED)
                .orElse(false);
    }

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> list(@RequestParam(required = false) String q, Pageable pageable) {
        return ResponseEntity.ok(productService.listPublic(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProductDTO>> listMy() {
        return ResponseEntity.ok(productService.listMyProductsAll());
    }

    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductRequestDTO request) {
        if (!isAuthorized()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(@PathVariable UUID id, @Valid @RequestBody ProductRequestDTO request) {
        if (!isAuthorized()) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        if (!isAuthorized()) {
            return ResponseEntity.status(403).build();
        }
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
