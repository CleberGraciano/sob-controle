package com.sobcontrole.finance.repository;

import com.sobcontrole.finance.domain.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
}