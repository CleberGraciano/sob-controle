package com.sobcontrole.finance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AdminSettingsRequest(
        @NotBlank String siteName,
        @NotBlank String logoUrl,
        @NotBlank String primaryColor,
        @NotBlank String smtpHost,
        @NotNull Integer smtpPort,
        @NotBlank String smtpUsername,
        @NotBlank String smtpPassword,
        @NotBlank String senderEmail,
        @NotBlank String senderName
) {
}