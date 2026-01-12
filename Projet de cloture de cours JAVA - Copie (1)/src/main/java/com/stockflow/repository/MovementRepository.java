package com.stockflow.repository;

import com.stockflow.entity.Movement;
import com.stockflow.entity.Product;
import com.stockflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovementRepository extends JpaRepository<Movement, Long> {
    List<Movement> findByUserOrderByCreatedAtDesc(User user);
    List<Movement> findByProductOrderByCreatedAtDesc(Product product);
    Page<Movement> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
