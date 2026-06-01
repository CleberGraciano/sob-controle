package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.domain.Role;
import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.dto.AuthRequest;
import com.sobcontrole.finance.dto.AuthResponse;
import com.sobcontrole.finance.dto.ForgotPasswordRequest;
import com.sobcontrole.finance.dto.RegisterRequest;
import com.sobcontrole.finance.repository.UserRepository;
import com.sobcontrole.finance.security.AuthenticatedUser;
import com.sobcontrole.finance.security.JwtService;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final String PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final DefaultCategoryService defaultCategoryService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       EmailService emailService,
                       DefaultCategoryService defaultCategoryService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.defaultCategoryService = defaultCategoryService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = userRepository.save(User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .active(true)
                .preferredPaymentMethod(PaymentMethod.PIX)
                .build());

        defaultCategoryService.ensureDefaults(user);

        return authenticate(new AuthRequest(request.email(), request.password()));
    }

    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        user.setLastLoginAt(LocalDateTime.now());

        AuthenticatedUser authenticatedUser = new AuthenticatedUser(user);
        String token = jwtService.generateToken(authenticatedUser);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getPreferredPaymentMethod());
    }

    @Transactional
    public void resetPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email()).orElse(null);
        if (user == null) {
            return;
        }

        String newPassword = generateTemporaryPassword(10);
        user.setPassword(passwordEncoder.encode(newPassword));
        emailService.sendNewPassword(user.getEmail(), user.getFullName(), newPassword);
    }

    private String generateTemporaryPassword(int length) {
        StringBuilder builder = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            builder.append(PASSWORD_CHARS.charAt(secureRandom.nextInt(PASSWORD_CHARS.length())));
        }
        return builder.toString();
    }
}