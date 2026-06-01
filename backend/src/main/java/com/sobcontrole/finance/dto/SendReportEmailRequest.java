package com.sobcontrole.finance.dto;

import jakarta.validation.constraints.NotBlank;

public record SendReportEmailRequest(
        @NotBlank String reference,
        @NotBlank String fileName,
        @NotBlank String pdfBase64
) {
}