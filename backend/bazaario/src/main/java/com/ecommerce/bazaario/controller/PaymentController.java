package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.entity.Payment;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private AuthService authService;

    @PostMapping("/initiate")
    public ResponseEntity<Map<String, Object>> initiatePayment(@RequestParam Long orderId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(paymentService.initiatePayment(user, orderId));
    }

    @PostMapping("/verify")
    public ResponseEntity<Payment> verifyPayment(@RequestBody Map<String, String> payload) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(paymentService.verifyPayment(user, payload));
    }

    @PostMapping("/cod")
    public ResponseEntity<Payment> completeCODPayment(@RequestParam Long orderId) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(paymentService.completeCODPayment(user, orderId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> razorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signatureHeader) {
        paymentService.processWebhook(payload, signatureHeader);
        return ResponseEntity.ok().build();
    }
}
