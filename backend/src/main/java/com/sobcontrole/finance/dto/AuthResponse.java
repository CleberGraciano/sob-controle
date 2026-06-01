package com.sobcontrole.finance.dto;

import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.domain.Role;

public record AuthResponse(
        String token,
        Long userId,
        String fullName,
        String email,
        Role role,
        PaymentMethod preferredPaymentMethod
) {
}