package com.ecommerce.backend.controller;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/products")
    public Page<ProductResponse> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long category,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        return productService.getAll(page, size, search, category, sort, minPrice, maxPrice);
    }

    @GetMapping("/products/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/products/slug/{slug}")
    public ProductResponse getBySlug(@PathVariable String slug) {
        return productService.getBySlug(slug);
    }

    @GetMapping("/products/featured")
    public List<ProductResponse> getFeatured() {
        return productService.getFeatured();
    }

    @GetMapping("/products/new-arrivals")
    public List<ProductResponse> getNewArrivals() {
        return productService.getNewArrivals();
    }

    @GetMapping("/products/{productId}/related")
    public List<ProductResponse> getRelated(@PathVariable Long productId) {
        return productService.getRelated(productId);
    }

    @GetMapping("/products/search")
    public List<ProductResponse> search(@RequestParam String q) {
        return productService.search(q);
    }

    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return productService.getCategories();
    }

    @PostMapping("/products")
    public ProductResponse create(@Valid @RequestBody ProductCreateRequest request) {
        return productService.create(request);
    }

    @PutMapping("/products/{id}")
    public ProductResponse update(@PathVariable Long id, @RequestBody ProductUpdateRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/products/{id}")
    public MessageResponse delete(@PathVariable Long id) {
        productService.delete(id);
        return new MessageResponse("Produit supprimé");
    }

    @PostMapping("/products/{productId}/reviews")
    public ReviewResponse addReview(@PathVariable Long productId,
                                    @Valid @RequestBody ReviewCreateRequest request) {
        return productService.addReview(productId, request);
    }

    @GetMapping("/products/{productId}/reviews")
    public Page<ReviewResponse> getReviews(@PathVariable Long productId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return productService.getReviews(productId, page, size);
    }

    @PostMapping(value = "/products/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ProductResponse uploadImage(@PathVariable Long productId,
                                       @RequestParam("image") MultipartFile image) {
        return productService.uploadImage(productId, image);
    }
}
