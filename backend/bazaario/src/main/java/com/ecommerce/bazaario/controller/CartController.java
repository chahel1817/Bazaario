package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.CartItemRequest;
import com.ecommerce.bazaario.entity.Cart;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.getCartByUser(user));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.addItemToCart(user, request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<Cart> updateCartItemQuantity(
            @PathVariable Long id, 
            @RequestParam int quantity) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.updateCartItemQuantity(user, id, quantity));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Cart> removeCartItem(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeCartItem(user, id));
    }
}
