package com.sobcontrole.finance.dto;

import com.sobcontrole.finance.domain.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotBlank String itemName,
        @NotNull Long categoryId,
        @NotNull LocalDate purchaseDate,
        @NotNull BigDecimal amount,
        @NotNull PaymentMethod paymentMethod,
        Long cardId,
        boolean installmentPurchase,
        Integer installmentCount,
        BigDecimal installmentValue
) {
}