import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Card } from '../../core/models/finance.models';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="cards-grid">
      <section class="glass-card cards-form-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">{{ editingCardId() ? 'Editar cartão' : 'Cartões' }}</h3>
            <p class="section-subtitle">Cadastre seus cartões para usar nos lançamentos e relatórios.</p>
          </div>
          <span class="chip">Gestão de meios de pagamento</span>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nome do cartão
            <input type="text" formControlName="name" placeholder="Cartão principal">
          </label>

          <div class="field-row">
            <label>
              Bandeira
              <input type="text" formControlName="brand" placeholder="Visa">
            </label>

            <label>
              Últimos 4 dígitos
              <input type="text" maxlength="4" formControlName="lastDigits" placeholder="1234">
            </label>
          </div>

          <label class="toggle-row">
            <span>Cartão de crédito</span>
            <input type="checkbox" formControlName="credit">
          </label>

          <div class="button-row">
            <button type="submit">{{ editingCardId() ? 'Salvar cartão' : 'Adicionar cartão' }}</button>
            <button type="button" class="secondary-button" *ngIf="editingCardId()" (click)="cancelEdit()">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="glass-card cards-list-card">
        <div class="section-head compact-head">
          <div>
            <h3 class="section-title">Cartões cadastrados</h3>
            <p class="section-subtitle">Mantenha seus cartões atualizados para vincular aos gastos.</p>
          </div>
        </div>

        <div class="list-stack" *ngIf="cards().length; else emptyState">
          <article class="mini-item" *ngFor="let card of cards()">
            <div>
              <strong>{{ card.name }}</strong>
              <small>{{ card.brand }} • **** {{ card.lastDigits }} • {{ card.credit ? 'Crédito' : 'Débito' }}</small>
            </div>
            <button type="button" class="text-button" (click)="startEdit(card)">Editar</button>
          </article>
        </div>

        <ng-template #emptyState>
          <p class="section-subtitle">Nenhum cartão cadastrado ainda.</p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .cards-form-card,
    .cards-list-card {
      padding: 24px;
      border-radius: 28px;
    }

    form {
      display: grid;
      gap: 16px;
      margin-top: 18px;
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
      background: rgba(255, 255, 255, 0.78);
    }

    button {
      border: none;
      background: linear-gradient(135deg, var(--primary), #27c48b);
      color: white;
      font-weight: 800;
      cursor: pointer;
    }

    .field-row,
    .button-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
    }

    .toggle-row {
      grid-template-columns: 1fr auto;
      align-items: center;
      padding: 14px 16px;
      border-radius: 16px;
      background: rgba(20, 33, 61, 0.05);
    }

    .toggle-row input {
      width: 18px;
      height: 18px;
      padding: 0;
    }

    .secondary-button,
    .text-button {
      background: transparent;
      color: var(--ink);
      border: 1px solid var(--line);
    }

    .secondary-button {
      max-width: 220px;
    }

    .text-button {
      width: auto;
      padding: 10px 14px;
      border-radius: 12px;
    }

    .list-stack {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .mini-item {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(20, 33, 61, 0.06);
    }

    .mini-item small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
    }

    .feedback {
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 700;
      margin-top: 14px;
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
      .cards-grid,
      .field-row,
      .button-row,
      .mini-item {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CardsComponent implements OnInit {
  protected readonly cards = signal<Card[]>([]);
  protected readonly editingCardId = signal<number | null>(null);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    lastDigits: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]{4}$')]],
    credit: true
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadCards();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Informe nome, bandeira e os 4 últimos dígitos do cartão.');
      return;
    }

    const request$ = this.editingCardId()
      ? this.financeService.updateCard(this.editingCardId() as number, this.form.getRawValue())
      : this.financeService.createCard(this.form.getRawValue());

    this.error.set('');
    this.message.set('');

    request$.subscribe({
      next: () => {
        this.message.set(this.editingCardId() ? 'Cartão atualizado.' : 'Cartão adicionado.');
        this.cancelEdit();
        this.loadCards();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar cartão.')
    });
  }

  protected startEdit(card: Card): void {
    this.editingCardId.set(card.id);
    this.form.patchValue({
      name: card.name,
      brand: card.brand,
      lastDigits: card.lastDigits,
      credit: card.credit
    });
  }

  protected cancelEdit(): void {
    this.editingCardId.set(null);
    this.form.patchValue({ name: '', brand: '', lastDigits: '', credit: true });
  }

  private loadCards(): void {
    this.financeService.getCards().subscribe({
      next: (response) => this.cards.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar cartões.')
    });
  }
}