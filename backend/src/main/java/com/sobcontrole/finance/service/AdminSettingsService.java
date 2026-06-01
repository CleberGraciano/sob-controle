package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.AppSettings;
import com.sobcontrole.finance.dto.AdminSettingsRequest;
import com.sobcontrole.finance.dto.AppSettingsResponse;
import com.sobcontrole.finance.repository.AppSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminSettingsService {

    private final AppSettingsRepository appSettingsRepository;

    public AdminSettingsService(AppSettingsRepository appSettingsRepository) {
        this.appSettingsRepository = appSettingsRepository;
    }

    @Transactional(readOnly = true)
    public AppSettingsResponse getSettings() {
        AppSettings settings = appSettingsRepository.findById(1L)
                .orElseThrow(() -> new IllegalArgumentException("Settings not found"));
        return map(settings);
    }

    @Transactional
    public AppSettingsResponse updateSettings(AdminSettingsRequest request) {
        AppSettings settings = appSettingsRepository.findById(1L)
                .orElseGet(() -> AppSettings.builder().id(1L).build());
        settings.setSiteName(request.siteName());
        settings.setLogoUrl(request.logoUrl());
        settings.setPrimaryColor(request.primaryColor());
        settings.setSmtpHost(request.smtpHost());
        settings.setSmtpPort(request.smtpPort());
        settings.setSmtpUsername(request.smtpUsername());
        settings.setSmtpPassword(request.smtpPassword());
        settings.setSenderEmail(request.senderEmail());
        settings.setSenderName(request.senderName());
        return map(appSettingsRepository.save(settings));
    }

    private AppSettingsResponse map(AppSettings settings) {
        return new AppSettingsResponse(
                settings.getSiteName(),
                settings.getLogoUrl(),
                settings.getPrimaryColor(),
                settings.getSmtpHost(),
                settings.getSmtpPort(),
                settings.getSmtpUsername(),
                settings.getSenderEmail(),
                settings.getSenderName()
        );
    }
}