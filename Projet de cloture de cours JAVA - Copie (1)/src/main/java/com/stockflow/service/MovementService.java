package com.stockflow.service;

import com.stockflow.dto.MovementDTO;
import com.stockflow.entity.Movement;
import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import com.stockflow.repository.MovementRepository;
import com.stockflow.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MovementService {
    
    @Autowired
    private MovementRepository movementRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    public Movement recordEntry(Long productId, Integer quantity, String reason, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        if (!product.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de modifier ce produit");
        }
        
        Integer previousQuantity = product.getQuantity();
        Integer newQuantity = previousQuantity + quantity;
        
        product.setQuantity(newQuantity);
        productRepository.save(product);
        
        Movement movement = new Movement();
        movement.setProduct(product);
        movement.setUser(user);
        movement.setType(Movement.MovementType.ENTRY);
        movement.setQuantity(quantity);
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);
        movement.setReason(reason != null ? reason : "Réception de stock");
        
        return movementRepository.save(movement);
    }
    
    public Movement recordExit(Long productId, Integer quantity, String reason, User user) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Produit non trouvé"));
        
        if (!product.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de modifier ce produit");
        }
        
        Integer previousQuantity = product.getQuantity();
        
        if (quantity > previousQuantity) {
            throw new RuntimeException("Quantité insuffisante en stock");
        }
        
        Integer newQuantity = Math.max(0, previousQuantity - quantity);
        
        product.setQuantity(newQuantity);
        productRepository.save(product);
        
        Movement movement = new Movement();
        movement.setProduct(product);
        movement.setUser(user);
        movement.setType(Movement.MovementType.EXIT);
        movement.setQuantity(quantity);
        movement.setPreviousQuantity(previousQuantity);
        movement.setNewQuantity(newQuantity);
        movement.setReason(reason != null ? reason : "Vente");
        
        return movementRepository.save(movement);
    }
    
    public List<Movement> getUserMovements(User user) {
        return movementRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public Page<Movement> getUserMovements(User user, Pageable pageable) {
        return movementRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }
    
    public MovementDTO toDTO(Movement movement) {
        MovementDTO dto = new MovementDTO();
        dto.setId(movement.getId());
        dto.setProductName(movement.getProduct().getName());
        dto.setType(movement.getType() == Movement.MovementType.ENTRY ? "Entrée" : "Sortie");
        dto.setQuantity(movement.getQuantity());
        dto.setPreviousQuantity(movement.getPreviousQuantity());
        dto.setNewQuantity(movement.getNewQuantity());
        dto.setReason(movement.getReason());
        dto.setCreatedAt(movement.getCreatedAt());
        
        return dto;
    }
    
    public List<MovementDTO> toDTOList(List<Movement> movements) {
        return movements.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}
