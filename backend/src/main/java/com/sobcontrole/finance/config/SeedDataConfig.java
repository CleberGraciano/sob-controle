package com.sobcontrole.finance.config;

import com.sobcontrole.finance.domain.AppSettings;
import com.sobcontrole.finance.domain.Category;
import com.sobcontrole.finance.domain.PaymentMethod;
import com.sobcontrole.finance.domain.Role;
import com.sobcontrole.finance.domain.User;
import com.sobcontrole.finance.repository.AppSettingsRepository;
import com.sobcontrole.finance.repository.CategoryRepository;
import com.sobcontrole.finance.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SeedDataConfig {

    @Bean
    CommandLineRunner seedDatabase(UserRepository userRepository,
                                   CategoryRepository categoryRepository,
                                   AppSettingsRepository appSettingsRepository,
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

            if (categoryRepository.findAllByUserOrderByNameAsc(admin).isEmpty()) {
                List<Category> categories = List.of(
                        Category.builder().name("Alimentação").monthlyLimit(new BigDecimal("700.00")).colorHex("#F77F39").iconKey("restaurant").user(admin).build(),
                        Category.builder().name("Transporte").monthlyLimit(new BigDecimal("600.00")).colorHex("#4B9CFF").iconKey("directions_bus").user(admin).build(),
                        Category.builder().name("Lazer").monthlyLimit(new BigDecimal("500.00")).colorHex("#9B5DE5").iconKey("sports_esports").user(admin).build(),
                        Category.builder().name("Saúde").monthlyLimit(new BigDecimal("500.00")).colorHex("#3BB273").iconKey("favorite").user(admin).build(),
                        Category.builder().name("Outros").monthlyLimit(new BigDecimal("800.00")).colorHex("#6B7280").iconKey("category").user(admin).build()
                );
                categoryRepository.saveAll(categories);
            }

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