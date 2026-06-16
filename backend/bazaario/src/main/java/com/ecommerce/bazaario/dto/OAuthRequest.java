package com.ecommerce.bazaario.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OAuthRequest {
    private String idToken;
    private String email;
    private String name;
    private String providerId;
}
