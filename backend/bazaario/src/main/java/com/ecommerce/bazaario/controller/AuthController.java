package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.AuthResponse;
import com.ecommerce.bazaario.dto.LoginRequest;
import com.ecommerce.bazaario.dto.RegisterRequest;
import com.ecommerce.bazaario.dto.OAuthRequest;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.security.JwtUtil;
import com.ecommerce.bazaario.repository.UserRepository;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.exception.BadRequestException;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.register(request);
        String refreshToken = jwtUtil.generateRefreshToken(authResponse.getEmail());
        setRefreshTokenCookie(response, refreshToken);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.login(request);
        String refreshToken = jwtUtil.generateRefreshToken(authResponse.getEmail());
        setRefreshTokenCookie(response, refreshToken);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> loginWithGoogle(@Valid @RequestBody OAuthRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.loginWithGoogle(request);
        String refreshToken = jwtUtil.generateRefreshToken(authResponse.getEmail());
        setRefreshTokenCookie(response, refreshToken);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String email = jwtUtil.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String newAccessToken = jwtUtil.generateToken(email);
        AuthResponse authResponse = new AuthResponse(newAccessToken, user.getEmail(), user.getName(), user.getRole(), user.getProvider());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        clearRefreshTokenCookie(response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/send-otp")
    public ResponseEntity<java.util.Map<String, String>> sendOtp() {
        return ResponseEntity.ok(authService.sendOtp());
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthResponse> setPassword(@Valid @RequestBody com.ecommerce.bazaario.dto.SetPasswordRequest request, HttpServletResponse response) {
        AuthResponse authResponse = authService.setPassword(request);
        String refreshToken = jwtUtil.generateRefreshToken(authResponse.getEmail());
        setRefreshTokenCookie(response, refreshToken);
        return ResponseEntity.ok(authResponse);
    }

    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true if on HTTPS / Production
                .path("/")
                .maxAge(604800) // 7 days in seconds
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshTokenCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
