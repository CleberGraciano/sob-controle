package com.sobcontrole.finance.dto;

import java.math.BigDecimal;

public record CategorySummaryResponse(
        Long categoryId,
        String category,
        String colorHex,
        String iconKey,
        BigDecimal spent,
        BigDecimal limit,
        int percentage
) {
}