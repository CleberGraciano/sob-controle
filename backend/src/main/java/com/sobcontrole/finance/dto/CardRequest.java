package com.sobcontrole.finance.dto;

import jakarta.validation.constraints.NotBlank;

public record CardRequest(
        @NotBlank String name,
        @NotBlank String brand,
        @NotBlank String lastDigits,
        boolean credit
) {
}