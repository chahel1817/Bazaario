package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.dto.CategoryResponse;
import com.ecommerce.bazaario.entity.Category;
import com.ecommerce.bazaario.exception.ResourceNotFoundException;
import com.ecommerce.bazaario.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Cacheable(value = "categories", key = "'all'")
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponse::from)
                .toList();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    @CacheEvict(value = {"categories", "homeSummary"}, allEntries = true)
    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }
}
