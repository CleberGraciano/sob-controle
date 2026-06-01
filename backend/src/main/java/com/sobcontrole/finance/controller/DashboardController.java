package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.dto.DashboardResponse;
import com.sobcontrole.finance.service.FinanceService;
import java.time.LocalDate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final FinanceService financeService;

    public DashboardController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> dashboard(@RequestParam(required = false) Integer year,
                                                       @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(financeService.getDashboard(
                year != null ? year : today.getYear(),
                month != null ? month : today.getMonthValue()
        ));
    }
}