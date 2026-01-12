package com.stockflow.repository;

import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByUser(User user);
    List<Product> findByUserAndQuantityGreaterThan(User user, Integer quantity);
    List<Product> findByUserAndQuantityEquals(User user, Integer quantity);
    List<Product> findByUserAndNameContainingIgnoreCase(User user, String name);
    
    @Query("SELECT p FROM Product p WHERE p.user = :user AND p.minThreshold > 0 AND p.quantity <= p.minThreshold")
    List<Product> findProductsToReorder(User user);
}
