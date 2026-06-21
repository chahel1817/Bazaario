package com.ecommerce.bazaario.dto;

import com.ecommerce.bazaario.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQty;
    private CategoryResponse category;
    private String imageUrl;
    private LocalDateTime createdAt;
    private boolean onDeal;
    private Integer discountPercent;

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStockQty(),
                CategoryResponse.from(product.getCategory()),
                product.getImageUrl(),
                product.getCreatedAt(),
                product.isOnDeal(),
                product.getDiscountPercent()
        );
    }
}
