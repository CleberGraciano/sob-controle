package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser)) {
            throw new IllegalStateException("Authenticated user not found");
        }
        return authenticatedUser.getUser();
    }
}