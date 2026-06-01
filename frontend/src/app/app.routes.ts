import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AdminSettingsComponent } from './features/admin/admin-settings.component';
import { AlertsComponent } from './features/alerts/alerts.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { LoginComponent } from './features/auth/login.component';
import { CardsComponent } from './features/cards/cards.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpenseEntryComponent } from './features/expenses/expense-entry.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ReportsComponent } from './features/reports/reports.component';
import { AppShellComponent } from './layout/app-shell.component';

export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '',
    component: AppShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'perfil', component: ProfileComponent },
      { path: 'lancamentos', component: ExpenseEntryComponent },
      { path: 'categorias', component: CategoriesComponent },
      { path: 'cartoes', component: CardsComponent },
      { path: 'alertas', component: AlertsComponent },
      { path: 'relatorios', component: ReportsComponent },
      { path: 'admin', component: AdminSettingsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];