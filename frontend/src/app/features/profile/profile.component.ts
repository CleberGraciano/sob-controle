import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-grid">
      <section class="glass-card profile-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Perfil do usuário</h3>
            <p class="section-subtitle">Atualize sua senha sem sair do painel.</p>
          </div>
          <span class="chip">Conta segura</span>
        </div>

        <div class="profile-summary">
          <div>
            <span>Nome</span>
            <strong>{{ userName() }}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{{ userEmail() }}</strong>
          </div>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Senha atual
            <input type="password" formControlName="currentPassword" placeholder="Digite sua senha atual">
          </label>

          <label>
            Nova senha
            <input type="password" formControlName="newPassword" placeholder="Mínimo 8 caracteres">
          </label>

          <label>
            Confirmar nova senha
            <input type="password" formControlName="confirmPassword" placeholder="Repita a nova senha">
          </label>

          <button type="submit" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Alterar senha' }}</button>
        </form>
      </section>
    </div>
  `,
  styles: [`
    .profile-grid {
      display: grid;
      gap: 24px;
    }

    .profile-card {
      padding: 24px;
      border-radius: 28px;
      display: grid;
      gap: 18px;
    }

    .profile-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .profile-summary div {
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(20, 33, 61, 0.06);
    }

    .profile-summary span {
      display: block;
      color: var(--muted);
      margin-bottom: 8px;
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

    @media (max-width: 720px) {
      .profile-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly userName = computed(() => this.authService.currentUser()?.fullName ?? 'Usuário');
  protected readonly userEmail = computed(() => this.authService.currentUser()?.email ?? '-');

  protected readonly form = this.formBuilder.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Preencha a senha atual e a nova senha corretamente.');
      return;
    }

    if (this.form.controls.newPassword.value !== this.form.controls.confirmPassword.value) {
      this.error.set('A confirmação da nova senha não confere.');
      return;
    }

    this.error.set('');
    this.message.set('');
    this.saving.set(true);

    this.authService.changePassword({
      currentPassword: this.form.controls.currentPassword.value,
      newPassword: this.form.controls.newPassword.value
    }).pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Senha alterada com sucesso.');
          this.form.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        },
        error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel alterar a senha.')
      });
  }
}