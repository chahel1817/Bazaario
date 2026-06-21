package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.dto.CategoryResponse;
import com.ecommerce.bazaario.dto.HomeSummaryResponse;
import com.ecommerce.bazaario.dto.ProductRequest;
import com.ecommerce.bazaario.dto.ProductResponse;
import com.ecommerce.bazaario.entity.Category;
import com.ecommerce.bazaario.entity.Product;
import com.ecommerce.bazaario.exception.ResourceNotFoundException;
import com.ecommerce.bazaario.repository.CategoryRepository;
import com.ecommerce.bazaario.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProducts(Long categoryId, String search, Pageable pageable) {
        Page<Product> products;
        if (categoryId != null && search != null && !search.trim().isEmpty()) {
            products = productRepository.findByCategoryIdAndNameContainingIgnoreCase(categoryId, search, pageable);
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId, pageable);
        } else if (search != null && !search.trim().isEmpty()) {
            products = productRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }
        return products.map(ProductResponse::from);
    }

    @Cacheable(value = "productResponses", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        return ProductResponse.from(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id)));
    }

    @CacheEvict(value = {"products", "productResponses", "homeSummary"}, allEntries = true)
    public ProductResponse createProduct(ProductRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Product product = new Product();
        updateProductFields(product, request, category);
        return ProductResponse.from(productRepository.save(product));
    }

    @CacheEvict(value = {"products", "productResponses", "homeSummary"}, allEntries = true)
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        updateProductFields(product, request, category);
        return ProductResponse.from(productRepository.save(product));
    }

    @CacheEvict(value = {"products", "productResponses", "homeSummary"}, allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public java.util.List<ProductResponse> getAutocompleteSuggestions(String query) {
        if (query == null || query.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return productRepository.findTop8ByNameContainingIgnoreCase(query).stream()
                .map(ProductResponse::from)
                .toList();
    }

    @Cacheable(value = "homeSummary", key = "'v1'")
    @Transactional(readOnly = true)
    public HomeSummaryResponse getHomeSummary() {
        List<ProductResponse> products = productRepository.findAll(PageRequest.of(0, 4, Sort.by("id").ascending()))
                .getContent()
                .stream()
                .map(ProductResponse::from)
                .toList();
        List<CategoryResponse> categories = categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
        return new HomeSummaryResponse(products, categories);
    }

    private void updateProductFields(Product product, ProductRequest request, Category category) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQty(request.getStockQty());
        product.setCategory(category);
        product.setImageUrl(request.getImageUrl());
    }
}
