package com.stockflow.service;

import com.stockflow.entity.Category;
import com.stockflow.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Optional<Category> findById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Category findOrCreateCategory(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        
        return categoryRepository.findByName(name.trim())
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setName(name.trim());
                    return categoryRepository.save(category);
                });
    }
    
    public Category createCategory(String name, String description) {
        if (categoryRepository.existsByName(name)) {
            throw new RuntimeException("Cette catégorie existe déjà");
        }
        
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        
        return categoryRepository.save(category);
    }
}
