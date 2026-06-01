package com.sobcontrole.finance.dto;

import com.sobcontrole.finance.domain.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        String itemName,
        BigDecimal amount,
        LocalDate purchaseDate,
        PaymentMethod paymentMethod,
        Long categoryId,
        String category,
        Long cardId,
        String cardLabel,
        boolean installmentPurchase,
        Integer installmentCount,
        BigDecimal installmentValue,
        String receiptName,
        String receiptDataUrl
) {
}