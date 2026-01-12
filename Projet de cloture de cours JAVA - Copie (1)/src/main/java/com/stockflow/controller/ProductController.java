package com.stockflow.controller;

import com.stockflow.dto.ProductDTO;
import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.CategoryService;
import com.stockflow.service.MovementService;
import com.stockflow.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/products")
public class ProductController {
    
    @Autowired
    private ProductService productService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private MovementService movementService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public String listProducts(Model model, Authentication authentication,
                              @RequestParam(required = false) String search,
                              @RequestParam(required = false) String filter) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        List<Product> products;
        
        if (search != null && !search.trim().isEmpty()) {
            products = productService.searchProducts(user, search);
        } else if ("stock".equals(filter)) {
            products = productService.getProductsInStock(user);
        } else if ("rupture".equals(filter)) {
            products = productService.getProductsInRupture(user);
        } else {
            products = productService.getUserProducts(user);
        }
        
        List<ProductDTO> productDTOs = productService.toDTOList(products);
        model.addAttribute("products", productDTOs);
        model.addAttribute("categories", categoryService.getAllCategories());
        model.addAttribute("currentFilter", filter != null ? filter : "all");
        model.addAttribute("searchTerm", search != null ? search : "");
        
        return "stock";
    }
    
    @PostMapping
    public String createProduct(@RequestParam String name,
                               @RequestParam(required = false) Integer quantity,
                               @RequestParam(required = false) Long categoryId,
                               @RequestParam(required = false) Integer minThreshold,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        try {
            productService.createProduct(name, quantity, categoryId, minThreshold, user);
            redirectAttributes.addFlashAttribute("success", "Produit ajouté avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/products";
    }
    
    @PostMapping("/{id}/update")
    public String updateProduct(@PathVariable Long id,
                               @RequestParam String name,
                               @RequestParam(required = false) Integer quantity,
                               @RequestParam(required = false) Long categoryId,
                               @RequestParam(required = false) Integer minThreshold,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        try {
            productService.updateProduct(id, name, quantity, categoryId, minThreshold, user);
            redirectAttributes.addFlashAttribute("success", "Produit modifié avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/products";
    }
    
    @PostMapping("/{id}/delete")
    public String deleteProduct(@PathVariable Long id,
                               Authentication authentication,
                               RedirectAttributes redirectAttributes) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        try {
            productService.deleteProduct(id, user);
            redirectAttributes.addFlashAttribute("success", "Produit supprimé avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/products";
    }
    
    @PostMapping("/{id}/entry")
    public String recordEntry(@PathVariable Long id,
                             @RequestParam Integer quantity,
                             @RequestParam(required = false) String reason,
                             Authentication authentication,
                             RedirectAttributes redirectAttributes) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        try {
            movementService.recordEntry(id, quantity, reason, user);
            redirectAttributes.addFlashAttribute("success", "Entrée enregistrée avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/products";
    }
    
    @PostMapping("/{id}/exit")
    public String recordExit(@PathVariable Long id,
                            @RequestParam Integer quantity,
                            @RequestParam(required = false) String reason,
                            Authentication authentication,
                            RedirectAttributes redirectAttributes) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        try {
            movementService.recordExit(id, quantity, reason, user);
            redirectAttributes.addFlashAttribute("success", "Sortie enregistrée avec succès !");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        
        return "redirect:/products";
    }
    
    private User getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        String email = authentication.getName();
        Optional<User> user = userRepository.findByEmail(email);
        return user.orElse(null);
    }
}
