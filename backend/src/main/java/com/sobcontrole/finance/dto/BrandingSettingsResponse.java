package com.sobcontrole.finance.dto;

public record BrandingSettingsResponse(
        String siteName,
        String logoUrl,
        String primaryColor
) {
}