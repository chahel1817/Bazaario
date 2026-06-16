package com.ecommerce.bazaario.service;

import com.ecommerce.bazaario.dto.AddressRequest;
import com.ecommerce.bazaario.entity.Address;
import com.ecommerce.bazaario.entity.User;
import com.ecommerce.bazaario.exception.BadRequestException;
import com.ecommerce.bazaario.exception.ResourceNotFoundException;
import com.ecommerce.bazaario.repository.AddressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class AddressService {

    @Autowired
    private AddressRepository addressRepository;

    public List<Address> getAddressesByUser(User user) {
        return addressRepository.findByUserId(user.getId());
    }

    @Transactional
    public Address addAddress(User user, AddressRequest request) {
        if (request.getIsDefault()) {
            resetDefaultAddresses(user);
        }

        Address address = new Address();
        address.setUser(user);
        updateAddressFields(address, request);
        return addressRepository.save(address);
    }

    @Transactional
    public Address updateAddress(User user, Long addressId, AddressRequest request) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this address");
        }

        if (request.getIsDefault()) {
            resetDefaultAddresses(user);
        }

        updateAddressFields(address, request);
        return addressRepository.save(address);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to this address");
        }

        addressRepository.delete(address);
    }

    private void resetDefaultAddresses(User user) {
        List<Address> addresses = addressRepository.findByUserId(user.getId());
        for (Address addr : addresses) {
            if (addr.getIsDefault()) {
                addr.setIsDefault(false);
                addressRepository.save(addr);
            }
        }
    }

    private void updateAddressFields(Address address, AddressRequest request) {
        address.setStreet(request.getStreet());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        address.setIsDefault(request.getIsDefault());
    }
}
