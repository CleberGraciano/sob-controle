package com.sobcontrole.finance.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyReportResponse(
        String reference,
        BigDecimal totalSpent,
        BigDecimal averageDaily,
        BigDecimal highestExpense,
        int totalTransactions,
        List<CategorySummaryResponse> categories,
        List<SuggestionResponse> suggestions,
        String insight
) {
}