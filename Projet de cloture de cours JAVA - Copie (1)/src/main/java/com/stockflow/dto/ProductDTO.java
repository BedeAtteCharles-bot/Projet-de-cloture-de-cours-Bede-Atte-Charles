package com.stockflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private Integer quantity;
    private Integer minThreshold;
    private Long categoryId;
    private String categoryName;
    private String status;
    private boolean needsReorder;
}
