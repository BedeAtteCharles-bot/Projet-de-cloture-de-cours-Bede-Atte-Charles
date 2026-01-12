package com.stockflow.service;

import com.stockflow.dto.ProductDTO;
import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import com.stockflow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryService categoryService;
    
    public Product createProduct(String name, Integer quantity, Long categoryId, 
                                 Integer minThreshold, User user) {
        Product product = new Product();
        product.setName(name);
        product.setQuantity(quantity != null ? quantity : 0);
        product.setMinThreshold(minThreshold != null ? minThreshold : 0);
        product.setUser(user);
        
        if (categoryId != null) {
            categoryService.findById(categoryId).ifPresent(product::setCategory);
        }
        
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, String name, Integer quantity, 
                                 Long categoryId, Integer minThreshold, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        if (!product.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de modifier ce produit");
        }
        
        product.setName(name);
        product.setQuantity(quantity != null ? quantity : 0);
        product.setMinThreshold(minThreshold != null ? minThreshold : 0);
        
        if (categoryId != null) {
            categoryService.findById(categoryId).ifPresent(product::setCategory);
        } else {
            product.setCategory(null);
        }
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id, User user) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        if (!product.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de supprimer ce produit");
        }
        
        productRepository.delete(product);
    }
    
    public List<Product> getUserProducts(User user) {
        return productRepository.findByUser(user);
    }
    
    public List<Product> getProductsInStock(User user) {
        return productRepository.findByUserAndQuantityGreaterThan(user, 0);
    }
    
    public List<Product> getProductsInRupture(User user) {
        return productRepository.findByUserAndQuantityEquals(user, 0);
    }
    
    public List<Product> getProductsToReorder(User user) {
        return productRepository.findProductsToReorder(user);
    }
    
    public List<Product> searchProducts(User user, String searchTerm) {
        return productRepository.findByUserAndNameContainingIgnoreCase(user, searchTerm);
    }
    
    public ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setQuantity(product.getQuantity());
        dto.setMinThreshold(product.getMinThreshold());
        dto.setStatus(product.isInStock() ? "En stock" : "Rupture");
        dto.setNeedsReorder(product.needsReorder());
        
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }
        
        return dto;
    }
    
    public List<ProductDTO> toDTOList(List<Product> products) {
        return products.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
