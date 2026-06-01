package com.sobcontrole.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record CategoryRequest(
        @NotBlank String name,
        @NotNull BigDecimal monthlyLimit,
        @NotBlank String colorHex,
        @NotBlank String iconKey
) {
}