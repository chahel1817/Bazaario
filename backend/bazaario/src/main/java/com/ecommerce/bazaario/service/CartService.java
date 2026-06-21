package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.dto.CartItemRequest;
import com.ecommerce.bazaario.dto.CartResponse;
import com.ecommerce.bazaario.entity.Cart;
import com.ecommerce.bazaario.entity.CartItem;
import com.ecommerce.bazaario.entity.Product;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.exception.ResourceNotFoundException;
import com.ecommerce.bazaario.repository.CartItemRepository;
import com.ecommerce.bazaario.repository.CartRepository;
import com.ecommerce.bazaario.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    public Cart getCartByUser(User user) {
        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    @Transactional
    public CartResponse getCartResponseByUser(User user) {
        return CartResponse.from(getCartByUser(user));
    }

    @Transactional
    public CartResponse addItemToCart(User user, CartItemRequest request) {
        Cart cart = getCartByUser(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (product.getStockQty() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock. Only " + product.getStockQty() + " items available.");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.getId(), product.getId());
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStockQty() < newQuantity) {
                throw new BadRequestException("Cannot add more. Total quantity in cart exceeds available stock.");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }

        return CartResponse.from(getCartByUser(user));
    }

    @Transactional
    public CartResponse updateCartItemQuantity(User user, Long cartItemId, int quantity) {
        Cart cart = getCartByUser(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to this cart item");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            Product product = cartItem.getProduct();
            if (product.getStockQty() < quantity) {
                throw new BadRequestException("Insufficient stock. Only " + product.getStockQty() + " items available.");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return CartResponse.from(getCartByUser(user));
    }

    @Transactional
    public CartResponse removeCartItem(User user, Long cartItemId) {
        Cart cart = getCartByUser(user);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Unauthorized access to this cart item");
        }

        cartItemRepository.delete(cartItem);
        return CartResponse.from(getCartByUser(user));
    }

    @Transactional
    public void clearCart(Cart cart) {
        cart.getItems().clear();
        cartRepository.save(cart);
    }
}
