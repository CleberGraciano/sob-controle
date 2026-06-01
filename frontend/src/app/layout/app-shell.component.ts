import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="shell-layout page-shell">
      <div class="mobile-overlay" *ngIf="mobileMenuOpen()" (click)="closeMobileMenu()"></div>

      <aside class="sidebar glass-card" [class.open]="mobileMenuOpen()">
        <div class="sidebar-top">
          <div>
            <img class="brand-logo" src="assets/logo.svg" alt="Sob Controle">
            <p>Controle diário com visão prática e alertas inteligentes.</p>
          </div>

          <nav>
            <a *ngFor="let item of menu()" [routerLink]="item.path" routerLinkActive="active" (click)="closeMobileMenu()">
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
        <header class="mobile-header">
          <div class="mobile-header-top">
            <button type="button" class="icon-button mobile-trigger" (click)="toggleMobileMenu()" aria-label="Abrir menu">
              <span class="material-icons-outlined">menu</span>
            </button>
            <button type="button" class="icon-button" routerLink="/alertas" aria-label="Ver alertas">
              <span class="material-icons-outlined">notifications</span>
            </button>
          </div>

          <div class="mobile-greeting">
            <strong>{{ greeting() }} <span class="wave">👋</span></strong>
            <small>{{ todayLabel() }}</small>
          </div>
        </header>

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

      <nav class="mobile-nav glass-card">
        <a *ngFor="let item of mobileNav()" [routerLink]="item.path" routerLinkActive="active" [class.primary-action]="item.primary">
          <span class="material-icons-outlined">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .shell-layout {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 24px;
      padding: 24px;
      position: relative;
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
      z-index: 30;
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

    .mobile-header,
    .mobile-nav,
    .mobile-overlay {
      display: none;
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

    .icon-button {
      width: 44px;
      height: 44px;
      display: grid;
      place-items: center;
      padding: 0;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
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
      .shell-layout {
        padding: 0;
        gap: 0;
        background: linear-gradient(180deg, #121d31 0, #121d31 260px, transparent 260px);
      }

      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        width: min(84vw, 320px);
        min-height: 100vh;
        height: 100vh;
        border-radius: 0 28px 28px 0;
        transform: translateX(-100%);
        transition: transform 0.24s ease;
      }

      .sidebar.open {
        transform: translateX(0);
      }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(9, 18, 33, 0.46);
        z-index: 20;
      }

      .mobile-header {
        display: grid;
        gap: 14px;
        padding: 18px 18px 10px;
        color: white;
      }

      .mobile-header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .mobile-trigger {
        background: transparent;
      }

      .mobile-greeting {
        display: grid;
        gap: 4px;
      }

      .mobile-greeting strong {
        font-size: 1.6rem;
        font-family: 'Space Grotesk', sans-serif;
      }

      .mobile-greeting small {
        color: rgba(255, 255, 255, 0.72);
      }

      .wave {
        font-size: 1.2rem;
      }

      .content-area {
        gap: 14px;
      }

      .topbar {
        display: none;
      }

      .router-panel {
        padding: 0 14px 104px;
      }

      .mobile-nav {
        position: fixed;
        left: 14px;
        right: 14px;
        bottom: 14px;
        z-index: 25;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;
        padding: 10px 8px calc(10px + env(safe-area-inset-bottom, 0px));
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.94);
      }

      .mobile-nav a {
        display: grid;
        justify-items: center;
        gap: 6px;
        padding: 8px 4px;
        color: var(--muted);
        text-decoration: none;
        font-size: 0.72rem;
        font-weight: 800;
      }

      .mobile-nav a.active {
        color: var(--primary-dark);
      }

      .mobile-nav .material-icons-outlined {
        font-size: 1.35rem;
      }

      .mobile-nav a.primary-action .material-icons-outlined {
        width: 52px;
        height: 52px;
        display: grid;
        place-items: center;
        border-radius: 999px;
        background: linear-gradient(135deg, var(--primary), #27c48b);
        color: white;
        box-shadow: 0 14px 26px rgba(24, 143, 105, 0.34);
      }

      .mobile-nav a.primary-action span:last-child {
        margin-top: -2px;
      }
    }
  `]
})
export class AppShellComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly mobileMenuOpen = signal(false);

  private readonly baseMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { path: '/perfil', label: 'Perfil', icon: 'person' },
    { path: '/lancamentos', label: 'Lançar gasto', icon: 'add_circle' },
    { path: '/categorias', label: 'Categorias', icon: 'category' },
    { path: '/cartoes', label: 'Cartões', icon: 'credit_card' },
    { path: '/relatorios', label: 'Relatórios', icon: 'bar_chart' },
    { path: '/alertas', label: 'Alertas', icon: 'notifications' },
    { path: '/admin', label: 'Super Admin', icon: 'shield' }
  ];

  protected readonly menu = computed(() => {
    const isSuperAdmin = this.authService.currentUser()?.role === 'SUPER_ADMIN';
    return this.baseMenu.filter((item) => isSuperAdmin || item.path !== '/admin');
  });
  protected readonly mobileNav = computed(() => {
    const base = this.menu().filter((item) => item.path !== '/admin');
    const mapped = base.map((item) => ({
      ...item,
      label: item.path === '/dashboard' ? 'Início' : item.path === '/lancamentos' ? 'Lançar' : item.label,
      primary: item.path === '/relatorios'
    }));

    return [
      mapped.find((item) => item.path === '/dashboard') ?? { path: '/dashboard', label: 'Início', icon: 'home', primary: false },
      mapped.find((item) => item.path === '/lancamentos') ?? { path: '/lancamentos', label: 'Lançar', icon: 'add_circle', primary: false },
      mapped.find((item) => item.path === '/relatorios') ?? { path: '/relatorios', label: 'Relatórios', icon: 'bar_chart', primary: true },
      mapped.find((item) => item.path === '/alertas') ?? { path: '/alertas', label: 'Alertas', icon: 'notifications', primary: false },
      { path: '/dashboard', label: 'Mais', icon: 'more_horiz', primary: false }
    ];
  });

  protected readonly userName = computed(() => this.authService.currentUser()?.fullName ?? 'Usuário');
  protected readonly userRole = computed(() => this.authService.currentUser()?.role === 'SUPER_ADMIN' ? 'Super admin' : 'Usuário');
  protected readonly greeting = computed(() => `Olá, ${this.userName()}`);
  protected readonly todayLabel = computed(() => new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(new Date()).replace(/^./, (value) => value.toUpperCase()));

  protected toggleMobileMenu(): void {
    this.mobileMenuOpen.update((state) => !state);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  protected logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}