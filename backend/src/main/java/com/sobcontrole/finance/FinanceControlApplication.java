package com.sobcontrole.finance;

import com.sobcontrole.finance.config.ApplicationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ApplicationProperties.class)
public class FinanceControlApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceControlApplication.class, args);
    }
}