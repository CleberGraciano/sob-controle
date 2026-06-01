package com.sobcontrole.finance.config;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource(ApplicationProperties applicationProperties) {
        CorsConfiguration config = new CorsConfiguration();
        Set<String> allowedOrigins = new LinkedHashSet<>(List.of(
            applicationProperties.frontendUrl(),
            "http://localhost:4200",
            "http://127.0.0.1:4200"
        ));
        config.setAllowedOrigins(List.copyOf(allowedOrigins));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}