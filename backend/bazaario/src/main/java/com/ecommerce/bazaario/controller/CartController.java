package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.CartItemRequest;
import com.ecommerce.bazaario.dto.CartResponse;
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
    public ResponseEntity<CartResponse> getCart() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.getCartResponseByUser(user));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(@Valid @RequestBody CartItemRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.addItemToCart(user, request));
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @PathVariable Long id, 
            @RequestParam int quantity) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.updateCartItemQuantity(user, id, quantity));
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(cartService.removeCartItem(user, id));
    }
}
