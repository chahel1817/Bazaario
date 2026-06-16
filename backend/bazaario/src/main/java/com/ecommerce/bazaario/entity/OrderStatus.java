package com.ecommerce.bazaario.entity;

public enum OrderStatus {
    PENDING,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    CANCELLED;

    public boolean isValidTransition(OrderStatus target) {
        if (this == target) {
            return true; // transitioning to the same status is a no-op / allowed
        }
        switch (this) {
            case PENDING:
                return target == PROCESSING || target == CANCELLED;
            case PROCESSING:
                return target == SHIPPED || target == CANCELLED;
            case SHIPPED:
                return target == DELIVERED || target == CANCELLED;
            case DELIVERED:
            case CANCELLED:
                return false; // Terminal states cannot transition to other states
            default:
                return false;
        }
    }
}
