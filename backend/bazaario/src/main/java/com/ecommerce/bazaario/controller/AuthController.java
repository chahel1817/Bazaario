package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.AuthResponse;
import com.ecommerce.bazaario.dto.LoginRequest;
import com.ecommerce.bazaario.dto.RegisterRequest;
import com.ecommerce.bazaario.dto.OAuthRequest;
import com.ecommerce.bazaario.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody OAuthRequest request) {
        return ResponseEntity.ok(authService.loginWithGoogle(request));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<java.util.Map<String, String>> sendOtp() {
        return ResponseEntity.ok(authService.sendOtp());
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthResponse> setPassword(@Valid @RequestBody com.ecommerce.bazaario.dto.SetPasswordRequest request) {
        return ResponseEntity.ok(authService.setPassword(request));
    }
}
