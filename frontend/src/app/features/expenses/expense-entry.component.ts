import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Card, Category, PaymentMethod } from '../../core/models/finance.models';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="entry-grid">
      <section class="form-card glass-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">Novo gasto</h3>
            <p class="section-subtitle">Registro rápido para não deixar compras acumularem no fim do dia.</p>
          </div>
          <span class="chip">Default: {{ paymentLabel(defaultPayment()) }}</span>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="expenseForm" (ngSubmit)="submitExpense()">
          <label>
            Item
            <input type="text" formControlName="itemName" placeholder="Compra no supermercado">
          </label>

          <label>
            Categoria
            <select formControlName="categoryId">
              <option value="">Selecione</option>
              <option *ngFor="let category of categories()" [value]="category.id">{{ category.name }}</option>
            </select>
          </label>

          <div class="field-row">
            <label>
              Data
              <input type="date" formControlName="purchaseDate">
            </label>
            <label>
              Valor total
              <input type="number" min="0" step="0.01" formControlName="amount" placeholder="380.00">
            </label>
          </div>

          <label>
            Forma de pagamento
            <select formControlName="paymentMethod">
              <option *ngFor="let paymentMethod of paymentMethods()" [value]="paymentMethod">{{ paymentLabel(paymentMethod) }}</option>
            </select>
          </label>

          <label *ngIf="isCreditCard()">
            Qual cartão?
            <select formControlName="cardId">
              <option value="">Selecione</option>
              <option *ngFor="let card of cards()" [value]="card.id">{{ card.name }} (**** {{ card.lastDigits }})</option>
            </select>
          </label>

          <label class="toggle-row">
            <span>Foi parcelado?</span>
            <input type="checkbox" formControlName="installmentPurchase">
          </label>

          <div class="field-row" *ngIf="isInstallment()">
            <label>
              N° de parcelas
              <input type="number" min="2" step="1" formControlName="installmentCount">
            </label>
            <label>
              Valor da parcela
              <input type="number" min="0" step="0.01" formControlName="installmentValue">
            </label>
          </div>

          <button type="submit" [disabled]="saving()">{{ saving() ? 'Salvando...' : 'Salvar lançamento' }}</button>
        </form>
      </section>

      <section class="side-stack">
        <article class="glass-card helper-card">
          <h3 class="section-title">Categorias</h3>
          <form [formGroup]="categoryForm" (ngSubmit)="submitCategory()">
            <input type="text" formControlName="name" placeholder="Ex.: Educação">
            <div class="field-row">
              <input type="number" min="0" step="0.01" formControlName="monthlyLimit" placeholder="Limite mensal">
              <input type="text" formControlName="colorHex" placeholder="#2BB0ED">
            </div>
            <input type="text" formControlName="iconKey" placeholder="bookmark">
            <button type="submit">Adicionar categoria</button>
          </form>
        </article>

        <article class="glass-card helper-card">
          <h3 class="section-title">Cartões</h3>
          <form [formGroup]="cardForm" (ngSubmit)="submitCard()">
            <input type="text" formControlName="name" placeholder="Nome do cartão">
            <div class="field-row">
              <input type="text" formControlName="brand" placeholder="Bandeira">
              <input type="text" maxlength="4" formControlName="lastDigits" placeholder="1234">
            </div>
            <label class="toggle-row compact-toggle">
              <span>Cartão de crédito</span>
              <input type="checkbox" formControlName="credit">
            </label>
            <button type="submit">Adicionar cartão</button>
          </form>
        </article>

        <article class="glass-card helper-card preview-card">
          <h3 class="section-title">Prévia rápida</h3>
          <p class="section-subtitle">Valor total</p>
          <strong>{{ expenseForm.controls.amount.value || 0 | currency:'BRL' }}</strong>
          <p *ngIf="isInstallment()">
            {{ expenseForm.controls.installmentCount.value || 0 }}x de {{ expenseForm.controls.installmentValue.value || 0 | currency:'BRL' }}
          </p>
        </article>
      </section>
    </div>
  `,
  styles: [`
    .entry-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 24px;
    }

    .form-card,
    .helper-card {
      padding: 24px;
      border-radius: 28px;
    }

    .side-stack {
      display: grid;
      gap: 24px;
      align-content: start;
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
      font-size: 0.95rem;
    }

    input,
    select,
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

    .field-row {
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

    .preview-card strong {
      display: block;
      margin-top: 10px;
      font-size: 2rem;
      font-family: 'Space Grotesk', sans-serif;
    }

    .feedback {
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 700;
      margin-bottom: 14px;
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
      .entry-grid,
      .field-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExpenseEntryComponent implements OnInit {
  protected readonly categories = signal<Category[]>([]);
  protected readonly cards = signal<Card[]>([]);
  protected readonly paymentMethods = signal<PaymentMethod[]>([]);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly defaultPayment = signal<PaymentMethod>('PIX');

  protected readonly expenseForm = this.formBuilder.nonNullable.group({
    itemName: ['', Validators.required],
    categoryId: '',
    purchaseDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMethod: 'PIX' as PaymentMethod,
    cardId: '',
    installmentPurchase: false,
    installmentCount: 2,
    installmentValue: 0
  });

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    monthlyLimit: 0,
    colorHex: ['#2BB0ED', Validators.required],
    iconKey: ['bookmark', Validators.required]
  });

  protected readonly cardForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    lastDigits: ['', [Validators.required, Validators.minLength(4)]],
    credit: true
  });

  protected readonly isCreditCard = computed(() => this.expenseForm.controls.paymentMethod.value === 'CREDIT_CARD');
  protected readonly isInstallment = computed(() => !!this.expenseForm.controls.installmentPurchase.value);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly financeService: FinanceService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.defaultPayment.set(this.authService.currentUser()?.preferredPaymentMethod ?? 'PIX');
    this.expenseForm.patchValue({ paymentMethod: this.defaultPayment() });
    this.refreshCollections();
  }

  protected submitExpense(): void {
    if (this.expenseForm.invalid || !this.expenseForm.controls.categoryId.value) {
      this.error.set('Preencha item, categoria, data e valor.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.message.set('');

    this.financeService.createExpense({
      ...this.expenseForm.getRawValue(),
      categoryId: Number(this.expenseForm.controls.categoryId.value),
      amount: Number(this.expenseForm.controls.amount.value),
      cardId: this.expenseForm.controls.cardId.value ? Number(this.expenseForm.controls.cardId.value) : null,
      installmentCount: this.isInstallment() ? Number(this.expenseForm.controls.installmentCount.value) : null,
      installmentValue: this.isInstallment() ? Number(this.expenseForm.controls.installmentValue.value) : null
    })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Lançamento salvo com sucesso.');
          this.expenseForm.patchValue({
            itemName: '',
            amount: 0,
            cardId: '',
            installmentPurchase: false,
            installmentCount: 2,
            installmentValue: 0
          });
        },
        error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar lançamento.')
      });
  }

  protected submitCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    this.financeService.createCategory({
      name: this.categoryForm.controls.name.value,
      monthlyLimit: Number(this.categoryForm.controls.monthlyLimit.value),
      colorHex: this.categoryForm.controls.colorHex.value,
      iconKey: this.categoryForm.controls.iconKey.value
    }).subscribe({
      next: () => {
        this.categoryForm.patchValue({ name: '', monthlyLimit: 0, colorHex: '#2BB0ED', iconKey: 'bookmark' });
        this.message.set('Categoria adicionada.');
        this.refreshCollections();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao criar categoria.')
    });
  }

  protected submitCard(): void {
    if (this.cardForm.invalid) {
      return;
    }

    this.financeService.createCard(this.cardForm.getRawValue()).subscribe({
      next: () => {
        this.cardForm.patchValue({ name: '', brand: '', lastDigits: '', credit: true });
        this.message.set('Cartão adicionado.');
        this.refreshCollections();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao criar cartão.')
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

  private refreshCollections(): void {
    this.financeService.getCategories().subscribe({
      next: (response) => this.categories.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar categorias.')
    });
    this.financeService.getCards().subscribe({
      next: (response) => this.cards.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar cartões.')
    });
    this.financeService.getPaymentMethods().subscribe({
      next: (response) => this.paymentMethods.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar formas de pagamento.')
    });
  }
}
