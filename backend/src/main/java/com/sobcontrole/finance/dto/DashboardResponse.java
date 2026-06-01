package com.sobcontrole.finance.dto;

import com.sobcontrole.finance.domain.PaymentMethod;
import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal monthSpent,
        BigDecimal monthlyLimit,
        BigDecimal available,
        int progressPercent,
        PaymentMethod preferredPaymentMethod,
        List<CategorySummaryResponse> categories,
        List<ExpenseResponse> recentExpenses,
        List<TrendPoint> expenseTrend,
        List<AlertResponse> alerts,
        List<SuggestionResponse> suggestions
) {
    public record TrendPoint(int day, BigDecimal accumulated) {
    }
}