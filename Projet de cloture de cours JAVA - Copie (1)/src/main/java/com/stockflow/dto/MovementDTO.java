package com.stockflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovementDTO {
    private Long id;
    private String productName;
    private String type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private String reason;
    private LocalDateTime createdAt;
}
