package com.stockflow.controller;

import com.stockflow.dto.MovementDTO;
import com.stockflow.entity.User;
import com.stockflow.repository.UserRepository;
import com.stockflow.service.MovementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/history")
public class MovementController {
    
    @Autowired
    private MovementService movementService;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping
    public String history(Model model, Authentication authentication) {
        User user = getCurrentUser(authentication);
        if (user == null) {
            return "redirect:/login";
        }
        
        List<MovementDTO> movements = movementService.toDTOList(
            movementService.getUserMovements(user)
        );
        
        model.addAttribute("movements", movements);
        
        return "history";
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
