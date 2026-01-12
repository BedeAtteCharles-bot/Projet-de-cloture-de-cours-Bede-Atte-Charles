package com.stockflow.controller;

import com.stockflow.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
public class AuthController {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;
    
    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error, Model model) {
        if (error != null) {
            model.addAttribute("error", "Email ou mot de passe incorrect");
        }
        return "login";
    }
    
    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }
    
    @PostMapping("/register")
    public String register(@RequestParam String name,
                          @RequestParam String email,
                          @RequestParam String password,
                          RedirectAttributes redirectAttributes,
                          HttpServletRequest request) {
        try {
            userService.createUser(name, email, password);
            
            // Auto-login après inscription
            try {
                UsernamePasswordAuthenticationToken authToken = 
                    new UsernamePasswordAuthenticationToken(email, password);
                authToken.setDetails(new WebAuthenticationDetails(request));
                Authentication authentication = authenticationManager.authenticate(authToken);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                request.getSession().setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, 
                    SecurityContextHolder.getContext());
            } catch (Exception e) {
                // Si l'auto-login échoue, rediriger vers la page de connexion
                redirectAttributes.addFlashAttribute("error", "Compte créé. Veuillez vous connecter.");
                return "redirect:/login";
            }
            
            redirectAttributes.addFlashAttribute("success", "Compte créé avec succès !");
            return "redirect:/dashboard";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        }
    }
}
