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
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
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

        return savedOrder;
    }

    public List<Order> getOrderHistory(User user) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public Order getOrderDetails(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Allow only the owner or an admin to view details
        if (!order.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Unauthorized access to this order details");
        }

        return order;
    }

    @Transactional
    public Order updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setStatus(status);
        return orderRepository.save(order);
    }
}
