package com.stockflow.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalProducts;
    private Integer totalQuantity;
    private Integer totalRupture;
    private Integer avgQuantity;
    private List<ProductDTO> topProducts;
    private List<ProductDTO> productsToReorder;
}
