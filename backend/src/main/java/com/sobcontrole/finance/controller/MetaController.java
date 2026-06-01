package com.sobcontrole.finance.controller;

import com.sobcontrole.finance.dto.BrandingSettingsResponse;
import com.sobcontrole.finance.service.AdminSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    private final AdminSettingsService adminSettingsService;

    public MetaController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping("/settings")
    public ResponseEntity<BrandingSettingsResponse> getBrandingSettings() {
        return ResponseEntity.ok(adminSettingsService.getBrandingSettings());
    }
}