package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.entity.*;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class OrderServiceConcurrencyTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private org.springframework.transaction.PlatformTransactionManager transactionManager;

    @org.junit.jupiter.api.BeforeEach
    @org.junit.jupiter.api.AfterEach
    public void cleanUp() {
        new org.springframework.transaction.support.TransactionTemplate(transactionManager).executeWithoutResult(status -> {
            userRepository.findByEmail("user1_concur@test.com").ifPresent(u -> {
                cartRepository.findByUserId(u.getId()).ifPresent(c -> {
                    cartItemRepository.deleteAll(c.getItems());
                    cartRepository.delete(c);
                });
                addressRepository.findByUserId(u.getId()).forEach(addressRepository::delete);
                userRepository.delete(u);
            });

            userRepository.findByEmail("user2_concur@test.com").ifPresent(u -> {
                cartRepository.findByUserId(u.getId()).ifPresent(c -> {
                    cartItemRepository.deleteAll(c.getItems());
                    cartRepository.delete(c);
                });
                addressRepository.findByUserId(u.getId()).forEach(addressRepository::delete);
                userRepository.delete(u);
            });

            productRepository.findAll().stream()
                    .filter(p -> "Concurring Product".equals(p.getName()))
                    .forEach(productRepository::delete);
        });
    }

    @Test
    public void testConcurrentOrderPlacementStockExhaustion() throws InterruptedException, ExecutionException {
        // 1. Create a product with exactly 1 item in stock
        Product product = new Product();
        product.setName("Concurring Product");
        product.setPrice(BigDecimal.valueOf(100.0));
        product.setStockQty(1);
        product = productRepository.save(product);

        // 2. Create User 1, Address 1, Cart 1, CartItem 1
        User user1 = new User();
        user1.setName("User One");
        user1.setEmail("user1_concur@test.com");
        user1.setPasswordHash("hash1");
        user1.setRole("ROLE_USER");
        user1.setProvider("LOCAL");
        user1 = userRepository.save(user1);

        Address address1 = new Address();
        address1.setUser(user1);
        address1.setStreet("Street 1");
        address1.setCity("City 1");
        address1.setState("State 1");
        address1.setPincode("110011");
        address1.setIsDefault(true);
        address1 = addressRepository.save(address1);

        Cart cart1 = new Cart();
        cart1.setUser(user1);
        cart1 = cartRepository.save(cart1);

        CartItem item1 = new CartItem();
        item1.setCart(cart1);
        item1.setProduct(product);
        item1.setQuantity(1);
        cartItemRepository.save(item1);

        // 3. Create User 2, Address 2, Cart 2, CartItem 2
        User user2 = new User();
        user2.setName("User Two");
        user2.setEmail("user2_concur@test.com");
        user2.setPasswordHash("hash2");
        user2.setRole("ROLE_USER");
        user2.setProvider("LOCAL");
        user2 = userRepository.save(user2);

        Address address2 = new Address();
        address2.setUser(user2);
        address2.setStreet("Street 2");
        address2.setCity("City 2");
        address2.setState("State 2");
        address2.setPincode("220022");
        address2.setIsDefault(true);
        address2 = addressRepository.save(address2);

        Cart cart2 = new Cart();
        cart2.setUser(user2);
        cart2 = cartRepository.save(cart2);

        CartItem item2 = new CartItem();
        item2.setCart(cart2);
        item2.setProduct(product);
        item2.setQuantity(1);
        cartItemRepository.save(item2);

        // 4. Set up multi-threaded concurrent order placement
        int numThreads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(numThreads);
        CountDownLatch latch = new CountDownLatch(1);

        final User finalUser1 = user1;
        final Address finalAddress1 = address1;
        final User finalUser2 = user2;
        final Address finalAddress2 = address2;

        Future<Order> future1 = executorService.submit(() -> {
            latch.await();
            return orderService.placeOrder(finalUser1, finalAddress1.getId());
        });

        Future<Order> future2 = executorService.submit(() -> {
            latch.await();
            return orderService.placeOrder(finalUser2, finalAddress2.getId());
        });

        // Trigger simultaneous start
        latch.countDown();

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failureCount = new AtomicInteger(0);
        Order placedOrder = null;

        try {
            placedOrder = future1.get();
            successCount.incrementAndGet();
        } catch (Exception e) {
            failureCount.incrementAndGet();
            assertTrue(e.getCause() instanceof BadRequestException, "Expected BadRequestException but got " + e.getCause());
        }

        try {
            Order o2 = future2.get();
            placedOrder = o2;
            successCount.incrementAndGet();
        } catch (Exception e) {
            failureCount.incrementAndGet();
            assertTrue(e.getCause() instanceof BadRequestException, "Expected BadRequestException but got " + e.getCause());
        }

        executorService.shutdown();

        // 5. Assertions
        assertEquals(1, successCount.get(), "Only one thread should successfully place the order");
        assertEquals(1, failureCount.get(), "One thread should fail due to insufficient stock");
        assertNotNull(placedOrder, "At least one order should be placed");

        // Verify stock is exactly 0 (no negative stock!)
        Product updatedProduct = productRepository.findById(product.getId()).orElseThrow();
        assertEquals(0, updatedProduct.getStockQty(), "Stock should be reduced to 0, not negative");
    }
}
