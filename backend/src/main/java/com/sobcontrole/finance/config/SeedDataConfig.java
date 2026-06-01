package com.sobcontrole.finance.config;

import com.sobcontrole.finance.domain.AppSettings;
import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.domain.Role;
import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.repository.AppSettingsRepository;
import com.sobcontrole.finance.repository.UserRepository;
import com.sobcontrole.finance.service.DefaultCategoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedDatabase(UserRepository userRepository,
                                   AppSettingsRepository appSettingsRepository,
                       DefaultCategoryService defaultCategoryService,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            User admin = userRepository.findByEmailIgnoreCase("admin@sobcontrole.com")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .fullName("Super Admin")
                            .email("admin@sobcontrole.com")
                            .password(passwordEncoder.encode("Admin@123"))
                            .role(Role.SUPER_ADMIN)
                            .active(true)
                            .preferredPaymentMethod(PaymentMethod.CREDIT_CARD)
                            .build()));

                        userRepository.findAll().forEach(defaultCategoryService::ensureDefaults);

            appSettingsRepository.findById(1L).orElseGet(() -> appSettingsRepository.save(AppSettings.builder()
                    .id(1L)
                    .siteName("SOB Controle")
                    .logoUrl("/assets/logo.svg")
                    .primaryColor("#1f8f6a")
                    .smtpHost("smtp.seuprovedor.com")
                    .smtpPort(587)
                    .smtpUsername("no-reply@sobcontrole.com")
                    .smtpPassword("change-me")
                    .senderEmail("no-reply@sobcontrole.com")
                    .senderName("SOB Controle")
                    .build()));
        };
    }
}