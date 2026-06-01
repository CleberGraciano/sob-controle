package com.sobcontrole.finance.service;

import com.sobcontrole.finance.domain.AppSettings;
import com.sobcontrole.finance.repository.AppSettingsRepository;
import java.util.Properties;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final AppSettingsRepository appSettingsRepository;

    public EmailService(AppSettingsRepository appSettingsRepository) {
        this.appSettingsRepository = appSettingsRepository;
    }

    public void sendNewPassword(String targetEmail, String fullName, String password) {
        AppSettings settings = appSettingsRepository.findById(1L)
                .orElseThrow(() -> new IllegalStateException("Application settings not found"));

        validateSmtpSettings(settings);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(settings.getSenderEmail());
        message.setTo(targetEmail);
        message.setSubject("Nova senha de acesso - " + settings.getSiteName());
        message.setText("Olá, " + fullName + ",\n\nSua nova senha temporária é: " + password
                + "\nFaça login e altere essa senha assim que possível.\n\nEquipe " + settings.getSiteName());

        try {
            buildMailSender(settings).send(message);
        } catch (MailException exception) {
            throw new IllegalStateException("Nao foi possivel enviar o email com as configuracoes SMTP atuais.");
        }
    }

    private JavaMailSenderImpl buildMailSender(AppSettings settings) {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(settings.getSmtpHost());
        mailSender.setPort(settings.getSmtpPort());
        mailSender.setUsername(settings.getSmtpUsername());
        mailSender.setPassword(settings.getSmtpPassword());
        mailSender.setProtocol("smtp");
        mailSender.setDefaultEncoding("UTF-8");

        Properties properties = mailSender.getJavaMailProperties();
        properties.put("mail.smtp.auth", "true");
        properties.put("mail.smtp.connectiontimeout", "10000");
        properties.put("mail.smtp.timeout", "10000");
        properties.put("mail.smtp.writetimeout", "10000");

        if (settings.getSmtpPort() != null && settings.getSmtpPort() == 465) {
            properties.put("mail.smtp.ssl.enable", "true");
            properties.put("mail.smtp.starttls.enable", "false");
        } else {
            properties.put("mail.smtp.starttls.enable", "true");
            properties.put("mail.smtp.starttls.required", "true");
        }

        return mailSender;
    }

    private void validateSmtpSettings(AppSettings settings) {
        if (isBlank(settings.getSmtpHost())
                || settings.getSmtpPort() == null
                || isBlank(settings.getSmtpUsername())
                || isBlank(settings.getSmtpPassword())
                || isBlank(settings.getSenderEmail())) {
            throw new IllegalStateException("Configure o SMTP completo no painel Super Admin antes de enviar emails.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}