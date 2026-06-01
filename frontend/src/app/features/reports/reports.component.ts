import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MonthlyReport } from '../../core/models/finance.models';
import { FinanceService } from '../../core/services/finance.service';
import { ReportPdfService } from '../../core/services/report-pdf.service';

Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, BaseChartDirective],
  template: `
    <div *ngIf="error()" class="feedback error">{{ error() }}</div>

    <div class="reports-grid" *ngIf="report() as data">
      <section class="report-hero glass-card">
        <div>
          <span class="chip">Fechamento mensal</span>
          <h2 class="section-title">Relatório {{ data.reference }}</h2>
          <p class="section-subtitle">Resumo do período com distribuição, insight e sugestões de economia.</p>
        </div>
        <button type="button" (click)="exportPdf()">Exportar PDF</button>
      </section>

      <section class="metrics">
        <article class="glass-card"><span>Total gasto</span><strong>{{ data.totalSpent | currency:'BRL' }}</strong></article>
        <article class="glass-card"><span>Média diária</span><strong>{{ data.averageDaily | currency:'BRL' }}</strong></article>
        <article class="glass-card"><span>Maior gasto</span><strong>{{ data.highestExpense | currency:'BRL' }}</strong></article>
        <article class="glass-card"><span>Transações</span><strong>{{ data.totalTransactions }}</strong></article>
      </section>

      <section class="panel glass-card chart-panel">
        <h3>Distribuição por categoria</h3>
        <div class="chart-wrapper">
          <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="'bar'"></canvas>
        </div>
      </section>

      <section class="panel glass-card">
        <h3>Resumo analítico</h3>
        <p class="insight">{{ data.insight }}</p>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Gasto</th>
              <th>Limite</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of data.categories">
              <td>{{ category.category }}</td>
              <td>{{ category.spent | currency:'BRL' }}</td>
              <td>{{ category.limit | currency:'BRL' }}</td>
              <td [class.over]="category.percentage >= 100" [class.warning]="category.percentage >= 80 && category.percentage < 100">
                {{ category.percentage >= 100 ? 'Excedido' : category.percentage >= 80 ? 'Atenção' : 'Dentro' }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="panel glass-card suggestions">
        <h3>Sugestões com IA</h3>
        <article *ngFor="let suggestion of data.suggestions">
          <div>
            <strong>{{ suggestion.title }}</strong>
            <p>{{ suggestion.description }}</p>
          </div>
          <span>{{ suggestion.potentialMonthlySavings | currency:'BRL' }}/mês</span>
        </article>
      </section>

      <section class="panel glass-card expenses-panel">
        <div class="panel-head">
          <div>
            <h3>Lançamentos do período</h3>
            <p class="section-subtitle">Comprovantes opcionais anexados aos gastos do mês.</p>
          </div>
        </div>

        <div class="expense-report-list" *ngIf="data.expenses.length; else noExpenses">
          <article *ngFor="let expense of data.expenses">
            <div>
              <strong>{{ expense.itemName }}</strong>
              <p>{{ expense.category }} • {{ expense.purchaseDate | date:'dd/MM/yyyy' }}</p>
              <small>{{ expense.amount | currency:'BRL' }}</small>
            </div>
            <div class="expense-report-receipt">
              <a *ngIf="expense.receiptDataUrl" [href]="expense.receiptDataUrl" [attr.download]="expense.receiptName || 'comprovante'" target="_blank" rel="noopener noreferrer">
                {{ expense.receiptName || 'Abrir comprovante' }}
              </a>
              <span *ngIf="!expense.receiptDataUrl">Sem comprovante</span>
            </div>
          </article>
        </div>

        <ng-template #noExpenses>
          <p class="section-subtitle">Nenhum lançamento encontrado no período.</p>
        </ng-template>
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

    .reports-grid {
      display: grid;
      gap: 22px;
    }

    .report-hero,
    .panel,
    .metrics article {
      border-radius: 30px;
      padding: 24px;
    }

    .report-hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }

    button {
      border: none;
      border-radius: 16px;
      padding: 14px 18px;
      background: linear-gradient(135deg, var(--primary), #27c48b);
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .metrics span {
      display: block;
      color: var(--muted);
      margin-bottom: 10px;
    }

    .metrics strong {
      font-size: 1.5rem;
      font-family: 'Space Grotesk', sans-serif;
    }

    .chart-panel {
      min-height: 0;
    }

    .chart-wrapper {
      position: relative;
      height: 320px;
      margin-top: 16px;
    }

    h3 {
      margin-top: 0;
      font-family: 'Space Grotesk', sans-serif;
    }

    .insight {
      margin: 0 0 16px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(247, 127, 57, 0.08);
      color: #9a4a1a;
      line-height: 1.6;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      padding: 14px 10px;
      text-align: left;
      border-bottom: 1px solid rgba(20, 33, 61, 0.08);
    }

    .over {
      color: var(--danger);
      font-weight: 800;
    }

    .warning {
      color: var(--warning);
      font-weight: 800;
    }

    .suggestions {
      display: grid;
      gap: 14px;
    }

    .suggestions article {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      padding: 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.72);
    }

    .suggestions p {
      margin: 8px 0 0;
      color: var(--muted);
    }

    .suggestions span {
      font-weight: 800;
      color: var(--primary-dark);
    }

    .expenses-panel {
      display: grid;
      gap: 16px;
    }

    .expense-report-list {
      display: grid;
      gap: 14px;
    }

    .expense-report-list article {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      padding: 16px 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.72);
    }

    .expense-report-list p,
    .expense-report-list small,
    .expense-report-receipt span {
      margin: 6px 0 0;
      color: var(--muted);
    }

    .expense-report-receipt {
      display: grid;
      align-content: center;
      justify-items: end;
    }

    .expense-report-receipt a {
      color: var(--primary-dark);
      font-weight: 800;
      text-decoration: none;
    }

    @media (max-width: 980px) {
      .report-hero,
      .metrics,
      .suggestions article,
      .expense-report-list article {
        grid-template-columns: 1fr;
        display: grid;
      }

      .expense-report-receipt {
        justify-items: start;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  protected readonly report = signal<MonthlyReport | null>(null);
  protected readonly error = signal('');

  protected barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderRadius: 10 }]
  };

  protected readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    datasets: {
      bar: {
        maxBarThickness: 72,
        categoryPercentage: 0.7,
        barPercentage: 0.8
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(20,33,61,0.08)' } }
    }
  };

  constructor(private readonly financeService: FinanceService, private readonly reportPdfService: ReportPdfService) {}

  ngOnInit(): void {
    this.financeService.getMonthlyReport().subscribe({
      next: (report) => {
        this.report.set(report);
        this.barChartData = {
          labels: report.categories.map((category) => category.category),
          datasets: [{ data: report.categories.map((category) => category.spent), backgroundColor: report.categories.map((category) => category.colorHex), borderRadius: 10 }]
        };
      },
      error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel carregar o relatorio mensal.')
    });
  }

  protected exportPdf(): void {
    const report = this.report();
    if (!report) {
      return;
    }

    this.reportPdfService.exportMonthlyReport(report);
  }
}
