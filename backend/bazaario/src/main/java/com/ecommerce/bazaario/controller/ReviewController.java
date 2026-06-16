package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.ReviewRequest;
import com.ecommerce.bazaario.entity.Review;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @PostMapping
    public ResponseEntity<Review> addReview(
            @PathVariable Long productId, 
            @Valid @RequestBody ReviewRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(reviewService.addReview(user, productId, request));
    }
}
