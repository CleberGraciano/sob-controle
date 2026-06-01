import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminSettings } from '../models/finance.models';

export interface BrandingSettings {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  private loaded = false;

  protected readonly defaults: BrandingSettings = {
    siteName: 'SOB Controle',
    logoUrl: 'assets/logo.svg',
    primaryColor: '#188f69'
  };

  readonly branding = signal<BrandingSettings>(this.defaults);

  load() {
    if (this.loaded) {
      return;
    }

    this.loaded = true;
    this.http.get<BrandingSettings>(`${environment.apiUrl}/meta/settings`)
      .subscribe({
        next: (settings) => this.applyBranding(settings),
        error: () => this.applyBranding(this.defaults)
      });
  }

  refresh() {
    return this.http.get<BrandingSettings>(`${environment.apiUrl}/meta/settings`)
      .pipe(tap((settings) => this.applyBranding(settings)));
  }

  applyAdminSettings(settings: Pick<AdminSettings, 'siteName' | 'logoUrl' | 'primaryColor'>): void {
    this.applyBranding(settings);
  }

  private applyBranding(settings: Partial<BrandingSettings>): void {
    const next = {
      ...this.defaults,
      ...this.branding(),
      ...settings,
      logoUrl: settings.logoUrl || this.branding().logoUrl || this.defaults.logoUrl,
      siteName: settings.siteName || this.branding().siteName || this.defaults.siteName,
      primaryColor: settings.primaryColor || this.branding().primaryColor || this.defaults.primaryColor
    };

    this.branding.set(next);
    this.document.title = next.siteName;
    this.document.documentElement.style.setProperty('--primary', next.primaryColor);
  }
}