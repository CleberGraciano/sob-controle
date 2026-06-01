package com.sobcontrole.finance.dto;

import java.math.BigDecimal;

public record CategoryResponse(
        Long id,
        String name,
        BigDecimal monthlyLimit,
        String colorHex,
        String iconKey,
        boolean systemDefined
) {
}