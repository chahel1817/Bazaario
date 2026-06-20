package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.entity.Order;
import com.ecommerce.bazaario.entity.Payment;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.repository.OrderRepository;
import com.ecommerce.bazaario.repository.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CartService cartService;

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Value("${razorpay.webhook.secret:your_webhook_secret}")
    private String webhookSecret;

    public Map<String, Object> initiatePayment(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this order");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(apiKey, apiSecret);
            
            JSONObject orderRequest = new JSONObject();
            // amount is in paise (1 INR = 100 paise)
            int amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100))
                    .setScale(0, java.math.RoundingMode.HALF_UP).intValueExact();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", order.getId().toString());
            
            com.razorpay.Order rzpOrder = razorpay.orders.create(orderRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", rzpOrder.get("id"));
            response.put("entity", "order");
            response.put("amount", rzpOrder.get("amount"));
            response.put("amount_paid", rzpOrder.get("amount_paid"));
            response.put("amount_due", rzpOrder.get("amount_due"));
            response.put("currency", rzpOrder.get("currency"));
            response.put("receipt", rzpOrder.get("receipt"));
            response.put("status", rzpOrder.get("status"));
            response.put("created_at", rzpOrder.get("created_at"));
            
            return response;
        } catch (RazorpayException e) {
            throw new BadRequestException("Razorpay order creation failed: " + e.getMessage());
        }
    }

    @Transactional
    public Payment verifyPayment(User user, Map<String, String> payload) {
        String razorpayOrderId = payload.get("razorpay_order_id");
        String razorpayPaymentId = payload.get("razorpay_payment_id");
        String razorpaySignature = payload.get("razorpay_signature");
        String orderIdStr = payload.get("order_id");

        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null || orderIdStr == null) {
            throw new BadRequestException("Missing payment verification details");
        }

        // Verify idempotency (check if payment was already processed)
        java.util.Optional<Payment> existingPaymentOpt = paymentRepository.findByTransactionId(razorpayPaymentId);
        if (existingPaymentOpt.isPresent()) {
            return existingPaymentOpt.get();
        }

        // Verify Razorpay signature
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);
            
            boolean isValid = Utils.verifyPaymentSignature(options, apiSecret);
            if (!isValid) {
                throw new BadRequestException("Invalid payment signature");
            }
        } catch (RazorpayException e) {
            throw new BadRequestException("Payment signature verification failed: " + e.getMessage());
        }

        Long orderId = Long.parseLong(orderIdStr);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this order");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    return p;
                });

        payment.setPaymentMethod("RAZORPAY");
        payment.setPaymentStatus("COMPLETED");
        payment.setTransactionId(razorpayPaymentId);
        payment.setAmount(order.getTotalAmount());
        
        order.setStatus(com.ecommerce.bazaario.entity.OrderStatus.PROCESSING); // Mark order as confirmed / processing
        orderRepository.save(order);

        // Clear cart after payment verification
        try {
            com.ecommerce.bazaario.entity.Cart cart = cartService.getCartByUser(user);
            cartService.clearCart(cart);
        } catch (Exception e) {
            // Log or ignore if cart is already empty/cleared
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment completeCODPayment(User user, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BadRequestException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this order");
        }

        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseGet(() -> {
                    Payment p = new Payment();
                    p.setOrder(order);
                    return p;
                });

        payment.setPaymentMethod("COD");
        payment.setPaymentStatus("PENDING"); // COD is pending until physical delivery
        payment.setTransactionId("COD_" + orderId);
        payment.setAmount(order.getTotalAmount());
        
        order.setStatus(com.ecommerce.bazaario.entity.OrderStatus.PROCESSING); // Mark order as confirmed / processing
        orderRepository.save(order);

        // Clear cart for COD orders
        try {
            com.ecommerce.bazaario.entity.Cart cart = cartService.getCartByUser(user);
            cartService.clearCart(cart);
        } catch (Exception e) {
            // Log or ignore
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public void processWebhook(String payload, String signatureHeader) {
        // Validate signature
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signatureHeader, webhookSecret);
            if (!isValid) {
                throw new BadRequestException("Invalid webhook signature");
            }
        } catch (RazorpayException e) {
            throw new BadRequestException("Webhook signature verification failed: " + e.getMessage());
        }

        JSONObject json = new JSONObject(payload);
        String event = json.optString("event");
        if ("order.paid".equals(event) || "payment.captured".equals(event)) {
            JSONObject eventPayload = json.optJSONObject("payload");
            if (eventPayload != null) {
                JSONObject rzpPayment = eventPayload.optJSONObject("payment");
                JSONObject rzpOrder = eventPayload.optJSONObject("order");

                if (rzpPayment != null && rzpOrder != null) {
                    JSONObject paymentEntity = rzpPayment.optJSONObject("entity");
                    JSONObject orderEntity = rzpOrder.optJSONObject("entity");

                    if (paymentEntity != null && orderEntity != null) {
                        String razorpayPaymentId = paymentEntity.optString("id");
                        String internalOrderIdStr = orderEntity.optString("receipt");
                        double amountInPaise = paymentEntity.optDouble("amount", 0);

                        if (internalOrderIdStr != null && !internalOrderIdStr.isEmpty()) {
                            try {
                                Long orderId = Long.parseLong(internalOrderIdStr);
                                Order order = orderRepository.findById(orderId).orElse(null);
                                if (order != null) {
                                    // Verify if payment already processed
                                    java.util.Optional<Payment> existingPaymentOpt = paymentRepository.findByTransactionId(razorpayPaymentId);
                                    if (existingPaymentOpt.isEmpty()) {
                                        Payment payment = paymentRepository.findByOrderId(order.getId())
                                                .orElseGet(() -> {
                                                    Payment p = new Payment();
                                                    p.setOrder(order);
                                                    return p;
                                                });

                                        payment.setPaymentMethod("RAZORPAY_WEBHOOK");
                                        payment.setPaymentStatus("COMPLETED");
                                        payment.setTransactionId(razorpayPaymentId);
                                        payment.setAmount(BigDecimal.valueOf(amountInPaise / 100.0));

                                        order.setStatus(com.ecommerce.bazaario.entity.OrderStatus.PROCESSING);
                                        orderRepository.save(order);
                                        paymentRepository.save(payment);
                                        System.out.println("Successfully processed payment webhook for Order ID: " + orderId);
                                    }
                                }
                            } catch (Exception e) {
                                System.err.println("Failed to process webhook order payload: " + e.getMessage());
                            }
                        }
                    }
                }
            }
        }
    }
}
