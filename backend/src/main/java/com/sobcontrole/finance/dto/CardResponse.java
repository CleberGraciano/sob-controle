package com.sobcontrole.finance.dto;

public record CardResponse(
        Long id,
        String name,
        String brand,
        String lastDigits,
        boolean credit
) {
}