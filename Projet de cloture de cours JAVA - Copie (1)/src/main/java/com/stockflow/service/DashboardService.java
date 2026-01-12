package com.stockflow.service;

import com.stockflow.dto.DashboardStatsDTO;
import com.stockflow.dto.ProductDTO;
import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DashboardService {
    
    @Autowired
    private ProductService productService;
    
    public DashboardStatsDTO getDashboardStats(User user) {
        List<Product> products = productService.getUserProducts(user);
        
        long totalProducts = products.size();
        int totalQuantity = products.stream()
                .mapToInt(p -> p.getQuantity() != null ? p.getQuantity() : 0)
                .sum();
        int totalRupture = (int) products.stream()
                .filter(p -> (p.getQuantity() == null || p.getQuantity() == 0))
                .count();
        int avgQuantity = totalProducts > 0 ? totalQuantity / (int) totalProducts : 0;
        
        // Top 5 produits par quantité
        List<ProductDTO> topProducts = products.stream()
                .sorted(Comparator.comparing((Product p) -> p.getQuantity() != null ? p.getQuantity() : 0).reversed())
                .limit(5)
                .map(productService::toDTO)
                .collect(Collectors.toList());
        
        // Produits à réapprovisionner
        List<ProductDTO> productsToReorder = productService.getProductsToReorder(user).stream()
                .map(productService::toDTO)
                .collect(Collectors.toList());
        
        DashboardStatsDTO stats = new DashboardStatsDTO();
        stats.setTotalProducts(totalProducts);
        stats.setTotalQuantity(totalQuantity);
        stats.setTotalRupture(totalRupture);
        stats.setAvgQuantity(avgQuantity);
        stats.setTopProducts(topProducts);
        stats.setProductsToReorder(productsToReorder);
        
        return stats;
    }
}
