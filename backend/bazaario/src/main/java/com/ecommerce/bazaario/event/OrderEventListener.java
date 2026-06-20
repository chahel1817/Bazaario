package com.ecommerce.bazaario.event;

import com.ecommerce.bazaario.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class OrderEventListener {

    @Autowired
    private EmailService emailService;

    @Async
    @EventListener
    public void handleOrderPlacedEvent(OrderPlacedEvent event) {
        System.out.println("Asynchronously handling order placed event for: " + event.getOrderNumber());
        emailService.sendOrderConfirmationEmail(
                event.getEmail(),
                event.getOrderNumber(),
                event.getTotalAmount()
        );
    }
}
