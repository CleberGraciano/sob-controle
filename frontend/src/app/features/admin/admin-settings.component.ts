import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="admin-grid">
      <section class="glass-card settings-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Super admin</h3>
            <p class="section-subtitle">Branding, SMTP e remetente padrão do sistema.</p>
          </div>
          <span class="chip">Painel estratégico</span>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field-row">
            <label>
              Nome do site
              <input formControlName="siteName" type="text">
            </label>
            <div class="upload-field">
              <span class="upload-label">Logo do sistema</span>
              <label class="upload-button">
                <input type="file" accept="image/*" (change)="onLogoSelected($event)">
                <span class="material-icons-outlined">upload</span>
                <span>{{ form.controls.logoUrl.value ? 'Trocar logo' : 'Anexar nova logo' }}</span>
              </label>
              <small class="upload-hint">Use PNG, JPG ou SVG com até 3 MB.</small>
              <div class="logo-preview" *ngIf="form.controls.logoUrl.value">
                <img [src]="form.controls.logoUrl.value" alt="Logo do sistema">
                <button type="button" class="secondary-button" (click)="clearLogo()">Remover logo</button>
              </div>
            </div>
          </div>

          <div class="field-row">
            <label>
              Cor principal
              <input formControlName="primaryColor" type="text">
            </label>
            <label>
              SMTP host
              <input formControlName="smtpHost" type="text">
            </label>
          </div>

          <div class="field-row">
            <label>
              SMTP porta
              <input formControlName="smtpPort" type="number">
            </label>
            <label>
              Usuário SMTP
              <input formControlName="smtpUsername" type="text">
            </label>
          </div>

          <div class="field-row">
            <label>
              Senha SMTP
              <input formControlName="smtpPassword" type="password" placeholder="Informe para atualizar">
            </label>
            <label>
              Email remetente
              <input formControlName="senderEmail" type="email">
            </label>
          </div>

          <label>
            Nome do remetente
            <input formControlName="senderName" type="text">
          </label>

          <button type="submit" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar configurações' }}</button>
        </form>
      </section>

      <section class="glass-card preview-card">
        <span class="chip">Prévia visual</span>
        <h3>{{ form.controls.siteName.value || 'SOB Controle' }}</h3>
        <p>Este painel centraliza identidade visual e toda a infraestrutura de envio de email do produto.</p>
        <div class="preview-logo" *ngIf="form.controls.logoUrl.value">
          <img [src]="form.controls.logoUrl.value" alt="Logo atual do sistema">
        </div>
        <div class="preview-brand" [style.background]="form.controls.primaryColor.value || '#188f69'">
          <span>Identidade</span>
          <strong>{{ form.controls.siteName.value || 'SOB' }}</strong>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .admin-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 24px;
    }

    .settings-card,
    .preview-card {
      padding: 24px;
      border-radius: 28px;
    }

    form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-weight: 700;
    }

    input,
    button {
      width: 100%;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid var(--line);
    }

    button {
      border: none;
      background: linear-gradient(135deg, var(--primary), #27c48b);
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    .secondary-button {
      width: auto;
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--line);
    }

    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .upload-field {
      display: grid;
      gap: 8px;
      align-content: start;
    }

    .upload-label {
      color: var(--muted);
      font-weight: 700;
    }

    .upload-button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      min-height: 54px;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px dashed var(--line);
      background: rgba(255, 255, 255, 0.78);
      color: var(--ink);
      cursor: pointer;
    }

    .upload-button input {
      display: none;
    }

    .upload-hint {
      color: var(--muted);
    }

    .logo-preview {
      display: grid;
      gap: 12px;
      padding: 14px;
      border-radius: 18px;
      border: 1px solid rgba(20, 33, 61, 0.08);
      background: rgba(255, 255, 255, 0.7);
      justify-items: start;
    }

    .logo-preview img,
    .preview-logo img {
      max-width: min(100%, 220px);
      max-height: 96px;
      object-fit: contain;
    }

    .preview-logo {
      display: grid;
      place-items: start;
      margin-top: 18px;
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(20, 33, 61, 0.06);
    }

    .preview-brand {
      margin-top: 18px;
      padding: 24px;
      border-radius: 24px;
      color: white;
    }

    .feedback {
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 800;
    }

    .success {
      background: rgba(24, 143, 105, 0.12);
      color: var(--primary-dark);
    }

    .error {
      background: rgba(239, 68, 68, 0.12);
      color: #9f1239;
    }

    @media (max-width: 980px) {
      .admin-grid,
      .field-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    siteName: ['', Validators.required],
    logoUrl: ['', Validators.required],
    primaryColor: ['#188f69', Validators.required],
    smtpHost: ['', Validators.required],
    smtpPort: 587,
    smtpUsername: ['', Validators.required],
    smtpPassword: ['', Validators.required],
    senderEmail: ['', [Validators.required, Validators.email]],
    senderName: ['', Validators.required]
  });

  constructor(private readonly formBuilder: FormBuilder, private readonly financeService: FinanceService) {}

  ngOnInit(): void {
    this.financeService.getAdminSettings().subscribe({
      next: (settings) => this.form.patchValue({ ...settings, smtpPassword: '' }),
      error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel carregar as configuracoes administrativas.')
    });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Preencha todos os campos obrigatórios.');
      return;
    }

    this.error.set('');
    this.message.set('');
    this.saving.set(true);
    this.financeService.updateAdminSettings(this.form.getRawValue())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.message.set('Configurações salvas com sucesso.'),
        error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel salvar as configuracoes.')
      });
  }

  protected onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.error.set('A logo deve ter no máximo 3 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ logoUrl: typeof reader.result === 'string' ? reader.result : '' });
      this.error.set('');
    };
    reader.onerror = () => this.error.set('Nao foi possivel ler a logo selecionada.');
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected clearLogo(): void {
    this.form.patchValue({ logoUrl: '' });
  }
}
