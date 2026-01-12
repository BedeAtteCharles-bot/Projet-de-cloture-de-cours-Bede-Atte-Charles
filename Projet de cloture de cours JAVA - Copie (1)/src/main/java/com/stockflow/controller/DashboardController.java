package com.stockflow.controller;

import com.stockflow.dto.DashboardStatsDTO;
import com.stockflow.entity.User;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;

@Controller
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/dashboard")
    public String dashboard(Model model, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        DashboardStatsDTO stats = dashboardService.getDashboardStats(user);
        model.addAttribute("stats", stats);
        
        return "dashboard";
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
