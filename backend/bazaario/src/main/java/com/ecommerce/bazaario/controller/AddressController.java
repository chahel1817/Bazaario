package com.ecommerce.bazaario.controller;

import com.ecommerce.bazaario.dto.AddressRequest;
import com.ecommerce.bazaario.entity.Address;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.service.AuthService;
import com.ecommerce.bazaario.service.AddressService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @Autowired
    private AuthService authService;

    @GetMapping
    public ResponseEntity<List<Address>> getAddresses() {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.getAddressesByUser(user));
    }

    @PostMapping
    public ResponseEntity<Address> addAddress(@Valid @RequestBody AddressRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.addAddress(user, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        User user = authService.getCurrentUser();
        return ResponseEntity.ok(addressService.updateAddress(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id) {
        User user = authService.getCurrentUser();
        addressService.deleteAddress(user, id);
        return ResponseEntity.noContent().build();
    }
}
