package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.HomeSummaryResponse;
import com.ecommerce.bazaario.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private ProductService productService;

    @GetMapping("/summary")
    public ResponseEntity<HomeSummaryResponse> getHomeSummary() {
        return ResponseEntity.ok(productService.getHomeSummary());
    }
}
