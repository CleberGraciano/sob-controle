package com.sobcontrole.finance.dto;

public record AlertResponse(
        String category,
        String status,
        String message,
        int percentage
) {
}