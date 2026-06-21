package com.ecommerce.bazaario.dto;

import com.ecommerce.bazaario.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private ProductResponse product;
    private Integer quantity;

    public static CartItemResponse from(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                ProductResponse.from(item.getProduct()),
                item.getQuantity()
        );
    }
}
