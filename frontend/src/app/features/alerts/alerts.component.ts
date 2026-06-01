import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { DashboardData } from '../../core/models/finance.models';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  template: `
    <div *ngIf="error()" class="feedback error">{{ error() }}</div>

    <section class="alerts-panel glass-card" *ngIf="dashboard() as data">
      <div class="panel-head">
        <div>
          <span class="chip">Monitoramento ativo</span>
          <h2 class="section-title">Alertas de limite</h2>
          <p class="section-subtitle">Categorias em zona de atenção ou com teto ultrapassado.</p>
        </div>
        <span class="chip secondary">{{ data.alerts.length }} alertas ativos</span>
      </div>

      <div class="alerts-list">
        <article *ngFor="let alert of data.alerts" [class.danger]="alert.status === 'LIMITE_EXCEDIDO'">
          <div>
            <strong>{{ alert.category }}</strong>
            <p>{{ alert.message }}</p>
          </div>
          <strong>{{ alert.percentage }}%</strong>
        </article>
      </div>

      <div class="overview-grid">
        <article *ngFor="let category of data.categories">
          <div>
            <strong>{{ category.category }}</strong>
            <small>{{ category.spent | currency:'BRL' }} de {{ category.limit | currency:'BRL' }}</small>
          </div>
          <div class="mini-progress">
            <span [style.width.%]="category.percentage > 100 ? 100 : category.percentage" [style.background]="category.colorHex"></span>
          </div>
          <strong [class.over]="category.percentage >= 100">{{ category.percentage }}%</strong>
        </article>
      </div>
    </section>
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

    .alerts-panel {
      padding: 24px;
      border-radius: 30px;
      display: grid;
      gap: 22px;
    }

    .panel-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .secondary {
      background: rgba(20, 33, 61, 0.06);
      color: var(--ink);
    }

    .alerts-list,
    .overview-grid {
      display: grid;
      gap: 16px;
    }

    .alerts-list article,
    .overview-grid article {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 18px;
      padding: 18px 20px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(20, 33, 61, 0.06);
      align-items: center;
    }

    .alerts-list article.danger {
      background: rgba(239, 68, 68, 0.08);
      border-color: rgba(239, 68, 68, 0.16);
    }

    .alerts-list p,
    .overview-grid small {
      margin: 6px 0 0;
      color: var(--muted);
    }

    .overview-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .mini-progress {
      grid-column: 1 / -1;
      height: 10px;
      border-radius: 999px;
      background: rgba(20, 33, 61, 0.08);
      overflow: hidden;
    }

    .mini-progress span {
      display: block;
      height: 100%;
    }

    .over {
      color: var(--danger);
    }

    @media (max-width: 820px) {
      .overview-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AlertsComponent implements OnInit {
  protected readonly dashboard = signal<DashboardData | null>(null);
  protected readonly error = signal('');

  constructor(private readonly financeService: FinanceService) {}

  ngOnInit(): void {
    this.financeService.getDashboard().subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: (error) => this.error.set(error.error?.message ?? 'Nao foi possivel carregar os alertas.')
    });
  }
}
