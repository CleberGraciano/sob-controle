package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.dto.AdminSettingsRequest;
import com.sobcontrole.finance.dto.AppSettingsResponse;
import com.sobcontrole.finance.service.AdminSettingsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminController {

    private final AdminSettingsService adminSettingsService;

    public AdminController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public ResponseEntity<AppSettingsResponse> getSettings() {
        return ResponseEntity.ok(adminSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<AppSettingsResponse> updateSettings(@Valid @RequestBody AdminSettingsRequest request) {
        return ResponseEntity.ok(adminSettingsService.updateSettings(request));
    }
}