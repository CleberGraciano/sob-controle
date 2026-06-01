import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page page-shell">
      <section class="hero-panel">
        <img class="hero-logo" [src]="branding().logoUrl" [alt]="branding().siteName">
        <span class="chip">Controle diário, rápido e visual</span>
        <h1>{{ branding().siteName }} coloca sua rotina financeira em uma interface feita para registrar gastos na hora em que acontecem.</h1>
        <p>Dashboard vivo, limites por categoria, alertas preventivos, relatórios mensais e sugestões de economia com IA.</p>

        <div class="hero-cards">
          <article class="mini-card glass-card">
            <strong>58%</strong>
            <span>do orçamento mensal utilizado</span>
          </article>
          <article class="mini-card glass-card">
            <strong>3 alertas</strong>
            <span>de categorias exigindo atenção</span>
          </article>
          <article class="mini-card glass-card">
            <strong>R$ 440</strong>
            <span>de economia potencial estimada</span>
          </article>
        </div>
      </section>

      <section class="auth-card glass-card">
        <div class="tab-row">
          <button type="button" [class.active]="mode() === 'login'" (click)="mode.set('login')">Entrar</button>
          <button type="button" [class.active]="mode() === 'register'" (click)="mode.set('register')">Criar conta</button>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="loginForm" *ngIf="mode() === 'login'" (ngSubmit)="submitLogin()">
          <label>
            Email
            <input type="email" formControlName="email" placeholder="voce@email.com">
          </label>

          <label>
            Senha
            <input type="password" formControlName="password" placeholder="Sua senha">
          </label>

          <div class="form-actions">
            <a routerLink="/forgot-password">Recuperar senha</a>
            <button type="submit" [disabled]="loading()">{{ loading() ? 'Entrando...' : 'Entrar' }}</button>
          </div>
        </form>

        <form [formGroup]="registerForm" *ngIf="mode() === 'register'" (ngSubmit)="submitRegister()">
          <label>
            Nome completo
            <input type="text" formControlName="fullName" placeholder="Juliana Silva">
          </label>

          <label>
            Email
            <input type="email" formControlName="email" placeholder="voce@email.com">
          </label>

          <label>
            Senha
            <input type="password" formControlName="password" placeholder="Mínimo 8 caracteres">
          </label>

          <button type="submit" [disabled]="loading()">{{ loading() ? 'Criando...' : 'Criar conta' }}</button>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .auth-page {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 28px;
      padding: 32px;
      align-items: stretch;
    }

    .hero-panel {
      padding: 40px;
      border-radius: 36px;
      background: linear-gradient(145deg, rgba(15, 23, 42, 0.97), rgba(24, 36, 70, 0.9));
      color: white;
      box-shadow: var(--shadow);
    }

    .hero-logo {
      display: block;
      width: min(360px, 100%);
      height: auto;
      margin-bottom: 22px;
      padding: 18px 22px;
      border-radius: 28px;
      background: rgba(255, 255, 255, 0.96);
      box-shadow: 0 20px 60px rgba(9, 18, 37, 0.24);
    }

    .hero-panel h1 {
      margin: 22px 0 16px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 4vw, 3.5rem);
      line-height: 1.05;
    }

    .hero-panel p {
      max-width: 640px;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.7;
    }

    .hero-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 34px;
    }

    .mini-card {
      padding: 20px;
      border-radius: 24px;
      color: var(--ink);
    }

    .mini-card strong {
      display: block;
      font-size: 1.6rem;
      font-family: 'Space Grotesk', sans-serif;
    }

    .mini-card span {
      display: block;
      margin-top: 8px;
      color: var(--muted);
    }

    .auth-card {
      display: grid;
      align-content: start;
      gap: 20px;
      padding: 28px;
      border-radius: 32px;
    }

    .tab-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 8px;
      border-radius: 20px;
      background: rgba(20, 33, 61, 0.05);
    }

    .tab-row button,
    .form-actions button,
    form button {
      border: none;
      border-radius: 16px;
      padding: 14px 16px;
      cursor: pointer;
      font-weight: 800;
    }

    .tab-row button {
      background: transparent;
      color: var(--muted);
    }

    .tab-row button.active,
    form button {
      background: linear-gradient(135deg, var(--primary), #27c48b);
      color: white;
    }

    form {
      display: grid;
      gap: 16px;
    }

    label {
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-size: 0.95rem;
      font-weight: 700;
    }

    input {
      width: 100%;
      padding: 15px 16px;
      border: 1px solid var(--line);
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.8);
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
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

    .feedback.success {
      background: rgba(24, 143, 105, 0.12);
      color: var(--primary-dark);
    }

    .feedback.error {
      background: rgba(239, 68, 68, 0.12);
      color: #9f1239;
    }

    @media (max-width: 980px) {
      .auth-page {
        grid-template-columns: 1fr;
      }

      .hero-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  private readonly brandingService = inject(BrandingService);
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly message = signal('');
  protected readonly branding = this.brandingService.branding;

  protected readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  protected readonly registerForm = this.formBuilder.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  protected submitLogin(): void {
    if (this.loginForm.invalid) {
      this.error.set('Preencha email e senha corretamente.');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    this.authService.login(this.loginForm.getRawValue() as { email: string; password: string })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error) => this.error.set(error.error?.message ?? 'Não foi possível entrar.')
      });
  }

  protected submitRegister(): void {
    if (this.registerForm.invalid) {
      this.error.set('Preencha todos os dados da conta.');
      return;
    }

    this.error.set('');
    this.loading.set(true);
    this.authService.register(this.registerForm.getRawValue() as { fullName: string; email: string; password: string })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error) => this.error.set(error.error?.message ?? 'Não foi possível criar sua conta.')
      });
  }
}