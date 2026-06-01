package com.sobcontrole.finance.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class CategorySchemaMigrationConfig {

    @Bean
    @Order(0)
    CommandLineRunner migrateCategorySchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            jdbcTemplate.execute("""
                    ALTER TABLE categories
                    ADD COLUMN IF NOT EXISTS system_defined BOOLEAN NOT NULL DEFAULT FALSE
                    """);

            jdbcTemplate.update("""
                    UPDATE categories
                    SET system_defined = TRUE
                    WHERE name = ? AND monthly_limit = ? AND color_hex = ? AND icon_key = ?
                    """, "Alimentação", 700.00, "#F77F39", "restaurant");

            jdbcTemplate.update("""
                    UPDATE categories
                    SET system_defined = TRUE
                    WHERE name = ? AND monthly_limit = ? AND color_hex = ? AND icon_key = ?
                    """, "Transporte", 600.00, "#4B9CFF", "directions_bus");

            jdbcTemplate.update("""
                    UPDATE categories
                    SET system_defined = TRUE
                    WHERE name = ? AND monthly_limit = ? AND color_hex = ? AND icon_key = ?
                    """, "Lazer", 500.00, "#9B5DE5", "sports_esports");

            jdbcTemplate.update("""
                    UPDATE categories
                    SET system_defined = TRUE
                    WHERE name = ? AND monthly_limit = ? AND color_hex = ? AND icon_key = ?
                    """, "Saúde", 500.00, "#3BB273", "favorite");

            jdbcTemplate.update("""
                    UPDATE categories
                    SET system_defined = TRUE
                    WHERE name = ? AND monthly_limit = ? AND color_hex = ? AND icon_key = ?
                    """, "Outros", 800.00, "#6B7280", "category");
        };
    }
}