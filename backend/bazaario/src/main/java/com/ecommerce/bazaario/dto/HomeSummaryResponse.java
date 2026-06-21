package com.ecommerce.bazaario.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HomeSummaryResponse {
    private List<ProductResponse> products;
    private List<CategoryResponse> categories;
}
