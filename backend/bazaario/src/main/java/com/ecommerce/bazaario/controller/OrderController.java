package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.OrderRequest;
import com.ecommerce.bazaario.entity.Order;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@Valid @RequestBody OrderRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.placeOrder(user, request.getAddressId()));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getOrderHistory() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getOrderHistory(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(orderService.getOrderDetails(user, id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }
}
