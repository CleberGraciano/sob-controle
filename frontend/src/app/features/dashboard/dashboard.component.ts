import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardData, PaymentMethod } from '../../core/models/finance.models';
import { FinanceService } from '../../core/services/finance.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink, BaseChartDirective],
  template: `
    <div *ngIf="error()" class="feedback error">{{ error() }}</div>

    <div class="dashboard-grid" *ngIf="dashboard() as data">
      <section class="hero glass-card">
        <div>
          <span class="chip hero-chip">Resumo do mês</span>
          <h2>Ritmo financeiro claro, com foco no que exige ação imediata.</h2>
          <div class="hero-stats">
            <article>
              <span>Gasto até agora</span>
              <strong>{{ data.monthSpent | currency:'BRL' }}</strong>
            </article>
            <article>
              <span>Limite mensal</span>
              <strong>{{ data.monthlyLimit | currency:'BRL' }}</strong>
            </article>
            <article>
              <span>Disponível</span>
              <strong>{{ data.available | currency:'BRL' }}</strong>
            </article>
          </div>
        </div>

        <div class="hero-side">
          <div class="progress-circle">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="48"></circle>
              <circle cx="60" cy="60" r="48" class="active" [style.strokeDashoffset]="302 - (302 * data.progressPercent / 100)"></circle>
            </svg>
            <strong>{{ data.progressPercent }}%</strong>
          </div>

          <div class="preferred">
            <span>Forma mais usada</span>
            <strong>{{ paymentLabel(data.preferredPaymentMethod) }}</strong>
          </div>
        </div>
      </section>

      <section class="panel glass-card">
        <div class="panel-head">
          <div>
            <h3 class="section-title">Gastos por categoria</h3>
            <p class="section-subtitle">Barras rápidas para entender pressão sobre cada limite.</p>
          </div>
          <a routerLink="/relatorios">Ver relatório</a>
        </div>

        <div class="category-list">
          <article *ngFor="let category of data.categories">
            <div class="category-top">
              <div class="category-meta">
                <div class="icon-box" [style.background]="category.colorHex + '22'" [style.color]="category.colorHex">
                  <span class="material-icons-outlined">{{ category.iconKey }}</span>
                </div>
                <div>
                  <strong>{{ category.category }}</strong>
                  <small>{{ category.spent | currency:'BRL' }} de {{ category.limit | currency:'BRL' }}</small>
                </div>
              </div>
              <strong [class.over]="category.percentage >= 100">{{ category.percentage }}%</strong>
            </div>
            <div class="bar-track">
              <span [style.width.%]="category.percentage > 100 ? 100 : category.percentage" [style.background]="category.colorHex"></span>
            </div>
          </article>
        </div>
      </section>

      <section class="panel glass-card chart-panel">
        <div class="panel-head">
          <div>
            <h3 class="section-title">Evolução dos gastos</h3>
            <p class="section-subtitle">Curva acumulada ao longo do mês.</p>
          </div>
        </div>
        <div class="chart-wrapper">
          <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="'line'"></canvas>
        </div>
      </section>

      <section class="panel glass-card chart-panel">
        <div class="panel-head">
          <div>
            <h3 class="section-title">Distribuição visual</h3>
            <p class="section-subtitle">Peso relativo de cada categoria.</p>
          </div>
        </div>
        <div class="chart-wrapper doughnut-wrapper">
          <canvas baseChart [data]="doughnutChartData" [options]="doughnutChartOptions" [type]="'doughnut'"></canvas>
        </div>
      </section>

      <section class="panel glass-card">
        <div class="panel-head">
          <div>
            <h3 class="section-title">Lançamentos recentes</h3>
            <p class="section-subtitle">Últimas compras registradas.</p>
          </div>
          <a routerLink="/lancamentos">Novo gasto</a>
        </div>

        <div class="expense-list">
          <article *ngFor="let expense of data.recentExpenses">
            <div>
              <strong>{{ expense.itemName }}</strong>
              <small>{{ expense.category }} • {{ expense.purchaseDate | date:'dd/MM/yyyy' }}</small>
            </div>
            <div class="expense-right">
              <span>{{ paymentLabel(expense.paymentMethod) }}</span>
              <strong>{{ expense.amount | currency:'BRL' }}</strong>
            </div>
          </article>
        </div>
      </section>

      <section class="panel glass-card suggestions-panel">
        <div class="panel-head">
          <div>
            <h3 class="section-title">Sugestões com IA</h3>
            <p class="section-subtitle">Oportunidades de economia baseadas no seu padrão atual.</p>
          </div>
        </div>

        <article *ngFor="let suggestion of data.suggestions">
          <div>
            <strong>{{ suggestion.title }}</strong>
            <p>{{ suggestion.description }}</p>
          </div>
          <span>{{ suggestion.potentialMonthlySavings | currency:'BRL' }}/mês</span>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .feedback {
      margin-bottom: 18px;
      padding: 14px 16px;
      border-radius: 18px;
      font-weight: 800;
    }

    .error {
      background: rgba(239, 68, 68, 0.12);
      color: #9f1239;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 22px;
      align-items: start;
    }

    .hero,
    .panel {
      border-radius: 30px;
      padding: 24px;
    }

    .hero {
      grid-column: span 12;
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 24px;
      background: linear-gradient(135deg, #12233c, #1d3458);
      color: white;
    }

    .hero-chip {
      background: rgba(255, 255, 255, 0.14);
      color: white;
    }

    .hero h2 {
      margin: 18px 0 22px;
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      line-height: 1.08;
      max-width: 700px;
    }

    .hero-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .hero-stats article,
    .preferred {
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
    }

    .hero-stats span,
    .preferred span {
      display: block;
      color: rgba(255, 255, 255, 0.72);
      margin-bottom: 10px;
    }

    .hero-side {
      display: grid;
      place-items: center;
      gap: 20px;
    }

    .progress-circle {
      position: relative;
      width: 150px;
      height: 150px;
    }

    .progress-circle svg {
      width: 150px;
      height: 150px;
      transform: rotate(-90deg);
    }

    .progress-circle circle {
      fill: none;
      stroke: rgba(255, 255, 255, 0.18);
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: 302;
    }

    .progress-circle circle.active {
      stroke: #2be0a4;
    }

    .progress-circle strong {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 1.8rem;
      font-family: 'Space Grotesk', sans-serif;
    }

    .panel {
      grid-column: span 6;
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 20px;
    }

    .panel-head a {
      color: var(--primary-dark);
      font-weight: 800;
      text-decoration: none;
    }

    .chart-panel {
      min-height: 0;
    }

    .chart-wrapper {
      position: relative;
      height: 320px;
      margin-top: 12px;
    }

    .doughnut-wrapper {
      height: 360px;
    }

    .category-list,
    .expense-list,
    .suggestions-panel {
      display: grid;
      gap: 14px;
    }

    .category-list article,
    .expense-list article,
    .suggestions-panel article {
      padding: 16px 18px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(20, 33, 61, 0.06);
    }

    .category-top,
    .expense-list article,
    .suggestions-panel article {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      align-items: center;
    }

    .category-meta {
      display: flex;
      gap: 14px;
      align-items: center;
    }

    .icon-box {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      display: grid;
      place-items: center;
    }

    .bar-track {
      width: 100%;
      height: 10px;
      border-radius: 999px;
      background: rgba(20, 33, 61, 0.08);
      overflow: hidden;
      margin-top: 12px;
    }

    .bar-track span {
      display: block;
      height: 100%;
    }

    .expense-right,
    .suggestions-panel span {
      text-align: right;
    }

    .suggestions-panel p,
    small,
    .expense-right span {
      color: var(--muted);
      margin: 6px 0 0;
    }

    .suggestions-panel span {
      font-weight: 800;
      color: var(--primary-dark);
      white-space: nowrap;
    }

    .over {
      color: var(--danger);
    }

    @media (max-width: 1100px) {
      .hero,
      .panel {
        grid-column: span 12;
      }

      .hero {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 720px) {
      .hero-stats,
      .category-top,
      .expense-list article,
      .suggestions-panel article {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected readonly dashboard = signal<DashboardData | null>(null);
  protected readonly error = signal('');

  protected lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Gasto acumulado', borderColor: '#188f69', backgroundColor: 'rgba(24,143,105,0.14)', fill: true, tension: 0.35 }]
  };

  protected readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(20,33,61,0.08)' } }
    }
  };

  protected doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }]
  };

  protected readonly doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    cutout: '68%'
  };

  constructor(private readonly financeService: FinanceService) {}

  ngOnInit(): void {
    this.financeService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.lineChartData = {
          labels: dashboard.expenseTrend.map((point) => String(point.day)),
          datasets: [{
            data: dashboard.expenseTrend.map((point) => point.accumulated),
            label: 'Gasto acumulado',
            borderColor: '#188f69',
            backgroundColor: 'rgba(24,143,105,0.14)',
            fill: true,
            tension: 0.35
          }]
        };
        this.doughnutChartData = {
          labels: dashboard.categories.map((category) => category.category),
          datasets: [{ data: dashboard.categories.map((category) => category.spent), backgroundColor: dashboard.categories.map((category) => category.colorHex) }]
        };
      },
      error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel carregar o dashboard.')
    });
  }

  protected paymentLabel(method: PaymentMethod): string {
    return {
      CREDIT_CARD: 'Cartão de crédito',
      DEBIT_CARD: 'Cartão de débito',
      PIX: 'Pix',
      CASH: 'Dinheiro',
      BANK_TRANSFER: 'Transferência',
      DIGITAL_WALLET: 'Carteira digital'
    }[method];
  }
}
