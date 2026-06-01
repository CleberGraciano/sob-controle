package com.sobcontrole.finance.dto;

import java.math.BigDecimal;

public record SuggestionResponse(
        String title,
        String description,
        BigDecimal potentialMonthlySavings
) {
}