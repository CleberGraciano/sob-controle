package com.sobcontrole.finance.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record ApplicationProperties(Jwt jwt, String frontendUrl) {

    public record Jwt(String secret, long expirationMinutes) {
    }
}