package com.ecommerce.bazaario.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String orderNumber, double totalAmount) {
        if (mailSender == null) {
            System.out.println("[Email Mock] Sending order confirmation to " + toEmail + " for Order #" + orderNumber);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom("no-reply@bazaario.com");
            helper.setTo(toEmail);
            helper.setSubject("Bazaario - Order Confirmation #" + orderNumber);
            
            String htmlContent = "<h1>Thank you for your order!</h1>"
                    + "<p>Dear customer, your order <strong>#" + orderNumber + "</strong> has been placed successfully.</p>"
                    + "<p><strong>Total Amount Paid:</strong> ₹" + String.format("%.2f", totalAmount) + "</p>"
                    + "<br/><p>Happy shopping!<br/>Team Bazaario</p>";
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Email sent successfully to " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + toEmail + ": " + e.getMessage());
        }
    }
}
