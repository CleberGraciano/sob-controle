import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell-layout page-shell">
      <aside class="sidebar glass-card">
        <div class="sidebar-top">
          <div>
            <img class="brand-logo" src="assets/logo.svg" alt="Sob Controle">
            <p>Controle diário com visão prática e alertas inteligentes.</p>
          </div>

          <nav>
            <a *ngFor="let item of menu()" [routerLink]="item.path" routerLinkActive="active">
              <span class="material-icons-outlined">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          </nav>
        </div>

        <div class="user-card">
          <div>
            <strong>{{ userName() }}</strong>
            <small>{{ userRole() }}</small>
          </div>
          <button type="button" (click)="logout()">Sair</button>
        </div>
      </aside>

      <main class="content-area">
        <header class="topbar glass-card">
          <div>
            <span class="chip">Resumo vivo do seu mês</span>
            <h2>{{ greeting() }}</h2>
          </div>

          <div class="topbar-actions">
            <button type="button" routerLink="/lancamentos">Novo gasto</button>
            <button type="button" class="ghost" routerLink="/alertas">Ver alertas</button>
          </div>
        </header>

        <section class="router-panel">
          <router-outlet />
        </section>
      </main>
    </div>
  `,
  styles: [`
    .shell-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      padding: 24px;
    }

    .sidebar {
      position: sticky;
      top: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-height: calc(100vh - 48px);
      padding: 28px;
      border-radius: 32px;
      background: linear-gradient(180deg, #0f172a 0%, #15213a 100%);
      color: white;
    }

    .sidebar-top {
      display: grid;
      gap: 18px;
      align-content: start;
    }

    .brand-logo {
      display: block;
      width: min(220px, 100%);
      height: auto;
      margin-bottom: 16px;
      filter: drop-shadow(0 18px 36px rgba(15, 23, 42, 0.22));
    }

    .sidebar p {
      margin: 0 0 28px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.6;
    }

    nav {
      display: grid;
      gap: 10px;
    }

    nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 18px;
      color: rgba(255, 255, 255, 0.82);
      text-decoration: none;
      transition: 0.2s ease;
    }

    nav a.active,
    nav a:hover {
      background: rgba(255, 255, 255, 0.12);
      color: white;
      transform: translateX(4px);
    }

    .user-card {
      display: flex;
      margin-top: auto;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 18px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.08);
    }

    .user-card small {
      display: block;
      margin-top: 4px;
      color: rgba(255, 255, 255, 0.62);
    }

    button {
      border: none;
      border-radius: 16px;
      padding: 12px 18px;
      background: var(--primary);
      color: white;
      font-weight: 700;
      cursor: pointer;
    }

    .content-area {
      display: grid;
      gap: 24px;
      align-content: start;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px;
      border-radius: 28px;
    }

    .topbar h2 {
      margin: 14px 0 0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.7rem;
    }

    .topbar-actions {
      display: flex;
      gap: 12px;
    }

    .ghost {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--line);
    }

    .router-panel {
      padding-bottom: 24px;
    }

    @media (max-width: 1100px) {
      .shell-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
        min-height: auto;
      }
    }

    @media (max-width: 720px) {
      .shell-layout,
      .topbar {
        padding: 18px;
      }

      .topbar {
        flex-direction: column;
        align-items: flex-start;
        gap: 18px;
      }

      .topbar-actions {
        width: 100%;
      }

      .topbar-actions button {
        flex: 1;
      }
    }
  `]
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly baseMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { path: '/lancamentos', label: 'Lançar gasto', icon: 'add_circle' },
    { path: '/relatorios', label: 'Relatórios', icon: 'bar_chart' },
    { path: '/alertas', label: 'Alertas', icon: 'notifications' },
    { path: '/admin', label: 'Super Admin', icon: 'shield' }
  ];

  protected readonly menu = computed(() => {
    const isSuperAdmin = this.authService.currentUser()?.role === 'SUPER_ADMIN';
    return this.baseMenu.filter((item) => isSuperAdmin || item.path !== '/admin');
  });

  protected readonly userName = computed(() => this.authService.currentUser()?.fullName ?? 'Usuário');
  protected readonly userRole = computed(() => this.authService.currentUser()?.role === 'SUPER_ADMIN' ? 'Super admin' : 'Usuário');
  protected readonly greeting = computed(() => `Olá, ${this.userName()}`);

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}