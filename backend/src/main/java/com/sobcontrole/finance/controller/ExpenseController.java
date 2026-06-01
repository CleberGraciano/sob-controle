package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.dto.ExpenseRequest;
import com.sobcontrole.finance.dto.ExpenseResponse;
import com.sobcontrole.finance.service.FinanceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final FinanceService financeService;

    public ExpenseController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ExpenseResponse>> recent() {
        return ResponseEntity.ok(financeService.listRecentExpenses());
    }

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethod>> paymentMethods() {
        return ResponseEntity.ok(financeService.getPaymentMethods());
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(financeService.createExpense(request));
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<ExpenseResponse> update(@PathVariable Long expenseId, @Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.ok(financeService.updateExpense(expenseId, request));
    }
}