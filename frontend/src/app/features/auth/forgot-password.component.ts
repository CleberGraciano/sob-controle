import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="forgot-page page-shell">
      <section class="forgot-card glass-card">
        <span class="chip">Recuperação de senha</span>
        <h1>Envio automático de uma nova senha para o email cadastrado.</h1>
        <p>O backend já está preparado para usar as configurações SMTP definidas pelo super admin.</p>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Email cadastrado
            <input type="email" formControlName="email" placeholder="voce@email.com">
          </label>

          <button type="submit" [disabled]="loading()">{{ loading() ? 'Enviando...' : 'Enviar nova senha' }}</button>
        </form>

        <a routerLink="/login">Voltar para login</a>
      </section>
    </div>
  `,
  styles: [`
    .forgot-page {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 32px;
    }

    .forgot-card {
      width: min(560px, 100%);
      padding: 32px;
      border-radius: 32px;
      display: grid;
      gap: 18px;
    }

    h1 {
      margin: 0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      line-height: 1.12;
    }

    p {
      margin: 0;
      color: var(--muted);
      line-height: 1.7;
    }

    form,
    label {
      display: grid;
      gap: 10px;
    }

    input,
    button {
      border-radius: 16px;
      border: 1px solid var(--line);
      padding: 14px 16px;
    }

    button {
      background: linear-gradient(135deg, var(--primary), #27c48b);
      border: none;
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    a {
      color: var(--primary-dark);
      text-decoration: none;
      font-weight: 700;
    }

    .feedback {
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 700;
    }

    .success {
      background: rgba(24, 143, 105, 0.12);
      color: var(--primary-dark);
    }

    .error {
      background: rgba(239, 68, 68, 0.12);
      color: #9f1239;
    }
  `]
})
export class ForgotPasswordComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private readonly formBuilder: FormBuilder, private readonly authService: AuthService) {}

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Informe um email válido.');
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.message.set('');

    this.authService.forgotPassword(this.form.getRawValue().email ?? '')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.message.set('Se o email existir, uma nova senha foi enviada.'),
        error: (error) => this.error.set(error.error?.message ?? 'Falha ao enviar a nova senha.')
      });
  }
}