package com.sobcontrole.finance.dto;

public record AppSettingsResponse(
        String siteName,
        String logoUrl,
        String primaryColor,
        String smtpHost,
        Integer smtpPort,
        String smtpUsername,
        String senderEmail,
        String senderName
) {
}