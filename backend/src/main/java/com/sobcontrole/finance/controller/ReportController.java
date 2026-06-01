package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.dto.MonthlyReportResponse;
import com.sobcontrole.finance.dto.SendReportEmailRequest;
import com.sobcontrole.finance.service.FinanceService;
import com.sobcontrole.finance.service.CurrentUserService;
import com.sobcontrole.finance.service.EmailService;
import java.time.LocalDate;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final FinanceService financeService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;

    public ReportController(FinanceService financeService,
                            EmailService emailService,
                            CurrentUserService currentUserService) {
        this.financeService = financeService;
        this.emailService = emailService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyReportResponse> monthly(@RequestParam(required = false) Integer year,
                                                         @RequestParam(required = false) Integer month) {
        LocalDate today = LocalDate.now();
        return ResponseEntity.ok(financeService.getMonthlyReport(
                year != null ? year : today.getYear(),
                month != null ? month : today.getMonthValue()
        ));
    }

    @PostMapping("/email")
    public ResponseEntity<Void> email(@Valid @RequestBody SendReportEmailRequest request) {
        User currentUser = currentUserService.requireCurrentUser();
        emailService.sendMonthlyReport(
                currentUser.getEmail(),
                currentUser.getFullName(),
                request.reference(),
                request.fileName(),
                request.pdfBase64()
        );
        return ResponseEntity.noContent().build();
    }
}