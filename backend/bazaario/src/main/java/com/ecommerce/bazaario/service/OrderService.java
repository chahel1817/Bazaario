package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.entity.*;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.exception.ResourceNotFoundException;
import com.ecommerce.bazaario.repository.AddressRepository;
import com.ecommerce.bazaario.repository.OrderRepository;
import com.ecommerce.bazaario.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ProductRepository productRepository;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    @Transactional
    public Order placeOrder(User user, Long addressId) {
        Cart cart = cartService.getCartByUser(user);
        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot place order with an empty cart");
        }

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized address specified for order");
        }

        Order order = new Order();
        order.setUser(user);
        order.setAddress(address);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            // Detach the product from the persistence context to bypass the L1 cache
            entityManager.detach(cartItem.getProduct());

            // Retrieve product with a pessimistic write lock to prevent race conditions on stock quantity
            Product product = productRepository.findByIdWithLock(cartItem.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + cartItem.getProduct().getId()));

            if (product.getStockQty() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product: " + product.getName() + 
                        ". Available stock: " + product.getStockQty());
            }

            // Deduct stock
            product.setStockQty(product.getStockQty() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(product.getPrice());
            orderItems.add(orderItem);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            totalAmount = totalAmount.add(itemTotal);
        }

        // Calculate GST (5%) and Platform Fee dynamically
        BigDecimal gst = totalAmount.multiply(new BigDecimal("0.05"));
        BigDecimal platformFee;
        if (totalAmount.compareTo(new BigDecimal("50")) < 0) {
            platformFee = new BigDecimal("0.99");
        } else if (totalAmount.compareTo(new BigDecimal("150")) < 0) {
            platformFee = new BigDecimal("1.99");
        } else {
            platformFee = new BigDecimal("2.99");
        }
        
        totalAmount = totalAmount.add(gst).add(platformFee);
        totalAmount = totalAmount.setScale(2, java.math.RoundingMode.HALF_UP);

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);

        // Clear cart right after the order is successfully placed (prevents double-ordering or check-out abandonment issues)
        cartService.clearCart(cart);

        return savedOrder;
    }

    public List<Order> getOrderHistory(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public void validateOrderAccess(Order order, User user) {
        if (!order.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Unauthorized access to this order");
        }
    }

    public Order getOrderDetails(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        validateOrderAccess(order, user);

        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status: " + status);
        }

        OrderStatus currentStatus = order.getStatus();
        if (!currentStatus.isValidTransition(newStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        return orderRepository.save(order);
    }
}
