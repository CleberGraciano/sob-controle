package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.AppSettings;
import com.sobcontrole.finance.repository.AppSettingsRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppSettingsRepository appSettingsRepository;

    public EmailService(JavaMailSender mailSender, AppSettingsRepository appSettingsRepository) {
        this.mailSender = mailSender;
        this.appSettingsRepository = appSettingsRepository;
    }

    public void sendNewPassword(String targetEmail, String fullName, String password) {
        AppSettings settings = appSettingsRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Application settings not found"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(settings.getSenderEmail());
        message.setTo(targetEmail);
        message.setSubject("Nova senha de acesso - " + settings.getSiteName());
        message.setText("Olá, " + fullName + ",\n\nSua nova senha temporária é: " + password
                + "\nFaça login e altere essa senha assim que possível.\n\nEquipe " + settings.getSiteName());
        mailSender.send(message);
    }
}