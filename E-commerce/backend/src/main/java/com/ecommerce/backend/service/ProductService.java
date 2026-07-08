package com.ecommerce.backend.service;

import com.ecommerce.backend.dto.*;
import com.ecommerce.backend.entity.Category;
import com.ecommerce.backend.entity.Product;
import com.ecommerce.backend.entity.Review;
import com.ecommerce.backend.entity.User;
import com.ecommerce.backend.exception.ApiException;
import com.ecommerce.backend.mapper.EntityMapper;
import com.ecommerce.backend.repository.CategoryRepository;
import com.ecommerce.backend.repository.ProductRepository;
import com.ecommerce.backend.repository.ReviewRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final EntityMapper mapper;
    private final FileStorageService fileStorageService;
    private final AuthService authService;

    public Page<ProductResponse> getAll(int page, int size, String search, Long category,
                                        String sort, BigDecimal minPrice, BigDecimal maxPrice) {
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));
        Specification<Product> spec = buildSpecification(search, category, minPrice, maxPrice);
        return productRepository.findAll(spec, pageable).map(mapper::toProductResponse);
    }

    public ProductResponse getById(Long id) {
        return mapper.toProductResponse(findProduct(id));
    }

    public ProductResponse getBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ApiException("Produit non trouvé", 404));
        return mapper.toProductResponse(product);
    }

    public List<ProductResponse> getFeatured() {
        return productRepository.findByFeaturedTrue().stream().map(mapper::toProductResponse).toList();
    }

    public List<ProductResponse> getNewArrivals() {
        return productRepository.findByIsNewTrue().stream().map(mapper::toProductResponse).toList();
    }

    public List<ProductResponse> getRelated(Long productId) {
        Product product = findProduct(productId);
        if (product.getCategory() == null) {
            return List.of();
        }
        return productRepository
                .findRelated(product.getCategory().getId(), productId, PageRequest.of(0, 4))
                .stream()
                .map(mapper::toProductResponse)
                .toList();
    }

    public List<ProductResponse> search(String query) {
        return getAll(0, 20, query, null, "newest", null, null).getContent();
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream().map(mapper::toCategoryResponse).toList();
    }

    @Transactional
    public ProductResponse create(ProductCreateRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ApiException("Catégorie non trouvée", 404));

        Product product = Product.builder()
                .name(request.name())
                .slug(generateSlug(request.name()))
                .description(request.description())
                .price(request.price())
                .originalPrice(request.originalPrice())
                .sku(request.sku())
                .imageUrl(request.imageUrl())
                .category(category)
                .stockQuantity(request.stockQuantity())
                .isNew(request.isNew() != null ? request.isNew() : false)
                .featured(request.featured() != null ? request.featured() : false)
                .build();

        if (request.imageUrl() != null) {
            product.getImages().add(request.imageUrl());
        }

        return mapper.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, com.ecommerce.backend.dto.ProductUpdateRequest request) {
        Product product = findProduct(id);

        if (request.name() != null) product.setName(request.name());
        if (request.description() != null) product.setDescription(request.description());
        if (request.price() != null) product.setPrice(request.price());
        if (request.originalPrice() != null) product.setOriginalPrice(request.originalPrice());
        if (request.sku() != null) product.setSku(request.sku());
        if (request.imageUrl() != null) product.setImageUrl(request.imageUrl());
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> new ApiException("Catégorie non trouvée", 404));
            product.setCategory(category);
        }
        if (request.stockQuantity() != null) product.setStockQuantity(request.stockQuantity());
        if (request.isNew() != null) product.setIsNew(request.isNew());
        if (request.featured() != null) product.setFeatured(request.featured());

        return mapper.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ApiException("Produit non trouvé", 404);
        }
        productRepository.deleteById(id);
    }

    @Transactional
    public ReviewResponse addReview(Long productId, ReviewCreateRequest request) {
        Product product = findProduct(productId);
        User user = authService.getAuthenticatedUser();

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .build();

        Review saved = reviewRepository.save(review);
        updateProductRating(product);
        return mapper.toReviewResponse(saved);
    }

    public Page<ReviewResponse> getReviews(Long productId, int page, int size) {
        findProduct(productId);
        return reviewRepository.findByProductId(productId, PageRequest.of(page, size))
                .map(mapper::toReviewResponse);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produit non trouvé", 404));
    }

    private void updateProductRating(Product product) {
        Page<Review> reviews = reviewRepository.findByProductId(product.getId(), PageRequest.of(0, 1000));
        if (reviews.isEmpty()) return;

        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        product.setRating(Math.round(avg * 10.0) / 10.0);
        product.setReviewCount((int) reviews.getTotalElements());
        productRepository.save(product);
    }

    private Sort resolveSort(String sort) {
        return switch (sort != null ? sort : "newest") {
            case "oldest" -> Sort.by(Sort.Direction.ASC, "createdAt");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name_asc" -> Sort.by(Sort.Direction.ASC, "name");
            case "name_desc" -> Sort.by(Sort.Direction.DESC, "name");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private Specification<Product> buildSpecification(String search, Long category,
                                                      BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("category").get("id"), category));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String generateSlug(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized + "-" + System.currentTimeMillis() % 10000;
    }

    @Transactional
    public ProductResponse uploadImage(Long id, org.springframework.web.multipart.MultipartFile file) {
        Product product = findProduct(id);
        try {
            String url = fileStorageService.storeProductImage(id, file);
            product.getImages().add(url);
            return mapper.toProductResponse(productRepository.save(product));
        } catch (Exception ex) {
            throw new ApiException("Erreur lors de l'upload de l'image", 500);
        }
    }
}
