package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.dto.AuthResponse;
import com.ecommerce.bazaario.dto.LoginRequest;
import com.ecommerce.bazaario.dto.RegisterRequest;
import com.ecommerce.bazaario.dto.OAuthRequest;
import com.ecommerce.bazaario.entity.Cart;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.repository.CartRepository;
import com.ecommerce.bazaario.repository.UserRepository;
import com.ecommerce.bazaario.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER"); // default role
        user.setProvider("LOCAL");
        user = userRepository.save(user);

        // Automatically create a cart for the registered user
        Cart cart = new Cart();
        cart.setUser(user);
        cartRepository.save(cart);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getProvider());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        if ("GOOGLE".equals(user.getProvider()) && user.getPasswordHash() == null) {
            throw new BadRequestException("This account uses Google Sign-In.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getProvider());
    }

    @Transactional
    public AuthResponse loginWithGoogle(OAuthRequest oauthRequest) {
        String email = oauthRequest.getEmail();
        String name = oauthRequest.getName();
        String providerId = oauthRequest.getProviderId();

        if (oauthRequest.getIdToken() != null && !oauthRequest.getIdToken().trim().isEmpty()) {
            if (oauthRequest.getIdToken().startsWith("mock_google_token_")) {
                // Format: mock_google_token_[email]_[name]_[sub]
                String[] parts = oauthRequest.getIdToken().split("_");
                if (parts.length >= 6) {
                    email = parts[3];
                    name = parts[4].replace("-", " ");
                    providerId = parts[5];
                }
            } else {
                // Real Google Token Verification via Google API Tokeninfo
                try {
                    RestTemplate restTemplate = new RestTemplate();
                    String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + oauthRequest.getIdToken();
                    Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                    if (response != null && response.containsKey("email")) {
                        email = (String) response.get("email");
                        name = (String) response.get("name");
                        providerId = (String) response.get("sub");
                    } else {
                        throw new BadRequestException("Invalid Google ID Token");
                    }
                } catch (Exception e) {
                    throw new BadRequestException("Google token verification failed: " + e.getMessage());
                }
            }
        }

        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email could not be resolved from Google auth");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;

        if (userOpt.isEmpty()) {
            // Flow 1: New Google user -> Create account
            user = new User();
            user.setName(name != null ? name : "Google User");
            user.setEmail(email);
            user.setPasswordHash(null);
            user.setRole("ROLE_USER");
            user.setProvider("GOOGLE");
            user.setProviderId(providerId);
            user = userRepository.save(user);

            // Automatically create a cart
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.save(cart);
        } else {
            user = userOpt.get();
            if ("LOCAL".equals(user.getProvider())) {
                // Flow 3: Existing LOCAL user + same email -> Link Google automatically
                user.setProvider("BOTH");
                user.setProviderId(providerId);
                user = userRepository.save(user);
            } else if ("GOOGLE".equals(user.getProvider()) || "BOTH".equals(user.getProvider())) {
                // Flow 2: Existing Google User (verify sub / providerId matches)
                if (user.getProviderId() == null) {
                    user.setProviderId(providerId);
                    user = userRepository.save(user);
                } else if (!user.getProviderId().equals(providerId)) {
                    throw new BadRequestException("Google account identifier mismatch.");
                }
            }
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getProvider());
    }

    private final java.util.concurrent.ConcurrentHashMap<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    public java.util.Map<String, String> sendOtp() {
        User user = getCurrentUser();
        // Generate a random 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        otpStore.put(user.getEmail(), otp);
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "OTP sent successfully to " + user.getEmail());
        response.put("otp", otp); // Return OTP in response payload for easy staging testing
        return response;
    }

    @Transactional
    public AuthResponse setPassword(com.ecommerce.bazaario.dto.SetPasswordRequest request) {
        User user = getCurrentUser();
        String storedOtp = otpStore.get(user.getEmail());
        
        if (storedOtp == null || !storedOtp.equals(request.getOtp())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        
        // Consume the OTP
        otpStore.remove(user.getEmail());
        
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        if ("GOOGLE".equals(user.getProvider())) {
            user.setProvider("BOTH");
        }
        user = userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole(), user.getProvider());
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new BadRequestException("No authenticated user");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
