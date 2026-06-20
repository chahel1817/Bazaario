package com.ecommerce.bazaario.event;

import org.springframework.context.ApplicationEvent;

public class OrderPlacedEvent extends ApplicationEvent {
    private final String email;
    private final String orderNumber;
    private final double totalAmount;

    public OrderPlacedEvent(Object source, String email, String orderNumber, double totalAmount) {
        super(source);
        this.email = email;
        this.orderNumber = orderNumber;
        this.totalAmount = totalAmount;
    }

    public String getEmail() {
        return email;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public double getTotalAmount() {
        return totalAmount;
    }
}
