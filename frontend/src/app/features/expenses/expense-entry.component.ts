import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Card, Category, Expense, PaymentMethod } from '../../core/models/finance.models';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="entry-grid">
      <section class="form-card glass-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">{{ editingExpenseId() ? 'Editar gasto' : 'Novo gasto' }}</h3>
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

          <p class="field-hint" *ngIf="!isCardPayment()">Selecione cartão de crédito ou débito para vincular um cartão ao gasto.</p>

          <label *ngIf="isCardPayment()">
            Qual cartão?
            <select formControlName="cardId">
              <option value="">Selecione</option>
              <option *ngFor="let card of cards()" [value]="card.id">{{ card.name }} (**** {{ card.lastDigits }})</option>
            </select>
          </label>

          <p class="field-hint warning" *ngIf="isCardPayment() && !cards().length">Cadastre um cartão abaixo para selecionar aqui.</p>

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

          <div class="button-row">
            <button type="submit" [disabled]="saving()">{{ saving() ? 'Salvando...' : editingExpenseId() ? 'Salvar alteração' : 'Salvar lançamento' }}</button>
            <button type="button" class="secondary-button" *ngIf="editingExpenseId()" (click)="cancelExpenseEdit()">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="side-stack">
        <article class="glass-card helper-card">
          <div class="section-head compact-head">
            <div>
              <h3 class="section-title">{{ editingCategoryId() ? 'Editar categoria' : 'Categorias' }}</h3>
              <p class="section-subtitle">Crie ou ajuste limites, cor e ícone.</p>
            </div>
          </div>

          <form [formGroup]="categoryForm" (ngSubmit)="submitCategory()">
            <input type="text" formControlName="name" placeholder="Ex.: Educação">
            <div class="field-row">
              <input type="number" min="0" step="0.01" formControlName="monthlyLimit" placeholder="Limite mensal">
              <label class="color-picker">
                <span>Cor da categoria</span>
                <div class="color-picker-field">
                  <input type="color" formControlName="colorHex">
                  <strong [style.color]="categoryForm.controls.colorHex.value">Escolher cor</strong>
                </div>
              </label>
            </div>
            <input type="text" formControlName="iconKey" placeholder="bookmark">
            <div class="button-row">
              <button type="submit">{{ editingCategoryId() ? 'Salvar categoria' : 'Adicionar categoria' }}</button>
              <button type="button" class="secondary-button" *ngIf="editingCategoryId()" (click)="cancelCategoryEdit()">Cancelar edição</button>
            </div>
          </form>

          <div class="list-stack compact-list" *ngIf="categories().length">
            <article class="mini-item" *ngFor="let category of categories()">
              <div class="mini-item-main">
                <span class="color-dot" [style.background]="category.colorHex"></span>
                <div>
                  <strong>{{ category.name }}</strong>
                  <small>Limite {{ category.monthlyLimit | currency:'BRL' }}</small>
                </div>
              </div>
              <button type="button" class="text-button" (click)="startCategoryEdit(category)">Editar</button>
            </article>
          </div>
        </article>

        <article class="glass-card helper-card">
          <h3 class="section-title">{{ editingCardId() ? 'Editar cartão' : 'Cartões' }}</h3>
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
            <div class="button-row">
              <button type="submit">{{ editingCardId() ? 'Salvar cartão' : 'Adicionar cartão' }}</button>
              <button type="button" class="secondary-button" *ngIf="editingCardId()" (click)="cancelCardEdit()">Cancelar edição</button>
            </div>
          </form>

          <div class="list-stack compact-list" *ngIf="cards().length">
            <article class="mini-item" *ngFor="let card of cards()">
              <div>
                <strong>{{ card.name }}</strong>
                <small>{{ card.brand }} • **** {{ card.lastDigits }} • {{ card.credit ? 'Crédito' : 'Débito' }}</small>
              </div>
              <button type="button" class="text-button" (click)="startCardEdit(card)">Editar</button>
            </article>
          </div>
        </article>

        <article class="glass-card helper-card">
          <div class="section-head compact-head">
            <div>
              <h3 class="section-title">Lançamentos recentes</h3>
              <p class="section-subtitle">Edite rapidamente um gasto já lançado.</p>
            </div>
          </div>

          <div class="list-stack" *ngIf="recentExpenses().length; else emptyExpenses">
            <article class="mini-item expense-item" *ngFor="let expense of recentExpenses()">
              <div>
                <strong>{{ expense.itemName }}</strong>
                <small>{{ expense.category }} • {{ expense.purchaseDate | date:'dd/MM/yyyy' }}</small>
                <small *ngIf="expense.cardLabel">{{ expense.cardLabel }}</small>
              </div>
              <div class="mini-item-actions">
                <strong>{{ expense.amount | currency:'BRL' }}</strong>
                <button type="button" class="text-button" (click)="startExpenseEdit(expense)">Editar</button>
              </div>
            </article>
          </div>

          <ng-template #emptyExpenses>
            <p class="field-hint">Seus lançamentos mais recentes aparecerão aqui.</p>
          </ng-template>
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
      font-weight: 700;
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

    .toggle-row input,
    .color-picker input[type='color'] {
      width: 18px;
      height: 18px;
      padding: 0;
    }

    .color-picker {
      color: var(--muted);
    }

    .color-picker span {
      font-size: 0.88rem;
    }

    .color-picker-field {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 54px;
      padding: 10px 14px;
      border-radius: 16px;
      border: 1px solid var(--line);
      background: rgba(255, 255, 255, 0.78);
    }

    .color-picker-field input[type='color'] {
      width: 42px;
      height: 42px;
      border: none;
      border-radius: 12px;
      background: transparent;
      overflow: hidden;
      cursor: pointer;
    }

    .field-hint {
      margin: -6px 0 0;
      color: var(--muted);
      font-size: 0.9rem;
    }

    .warning {
      color: #9a4a1a;
    }

    .compact-head {
      margin-bottom: 0;
    }

    .list-stack {
      display: grid;
      gap: 12px;
      margin-top: 18px;
    }

    .compact-list {
      margin-top: 16px;
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

    .mini-item-main {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      flex: none;
      box-shadow: 0 0 0 4px rgba(20, 33, 61, 0.06);
    }

    .mini-item small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
    }

    .mini-item-actions {
      display: grid;
      gap: 8px;
      justify-items: end;
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
      .field-row,
      .button-row,
      .mini-item {
        grid-template-columns: 1fr;
      }

      .mini-item-actions {
        justify-items: start;
      }
    }
  `]
})
export class ExpenseEntryComponent implements OnInit {
  protected readonly categories = signal<Category[]>([]);
  protected readonly cards = signal<Card[]>([]);
  protected readonly recentExpenses = signal<Expense[]>([]);
  protected readonly paymentMethods = signal<PaymentMethod[]>([]);
  protected readonly saving = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');
  protected readonly defaultPayment = signal<PaymentMethod>('PIX');
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingCardId = signal<number | null>(null);
  protected readonly editingExpenseId = signal<number | null>(null);

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
    colorHex: '#2BB0ED',
    iconKey: 'bookmark'
  });

  protected readonly cardForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    brand: ['', Validators.required],
    lastDigits: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4), Validators.pattern('^[0-9]{4}$')]],
    credit: true
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly financeService: FinanceService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.defaultPayment.set(this.authService.currentUser()?.preferredPaymentMethod ?? 'PIX');
    this.resetExpenseForm();
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

    const payload = {
      ...this.expenseForm.getRawValue(),
      categoryId: Number(this.expenseForm.controls.categoryId.value),
      amount: Number(this.expenseForm.controls.amount.value),
      cardId: this.isCardPayment() && this.expenseForm.controls.cardId.value ? Number(this.expenseForm.controls.cardId.value) : null,
      installmentCount: this.isInstallment() ? Number(this.expenseForm.controls.installmentCount.value) : null,
      installmentValue: this.isInstallment() ? Number(this.expenseForm.controls.installmentValue.value) : null
    };

    const request$ = this.editingExpenseId()
      ? this.financeService.updateExpense(this.editingExpenseId() as number, payload)
      : this.financeService.createExpense(payload);

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set(this.editingExpenseId() ? 'Lançamento atualizado com sucesso.' : 'Lançamento salvo com sucesso.');
          this.cancelExpenseEdit();
          this.refreshCollections();
        },
        error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar lançamento.')
      });
  }

  protected submitCategory(): void {
    if (this.categoryForm.invalid) {
      return;
    }

    const payload = {
      name: this.categoryForm.controls.name.value,
      monthlyLimit: Number(this.categoryForm.controls.monthlyLimit.value),
      colorHex: this.categoryForm.controls.colorHex.value,
      iconKey: this.categoryForm.controls.iconKey.value
    };

    const request$ = this.editingCategoryId()
      ? this.financeService.updateCategory(this.editingCategoryId() as number, payload)
      : this.financeService.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.message.set(this.editingCategoryId() ? 'Categoria atualizada.' : 'Categoria adicionada.');
        this.cancelCategoryEdit();
        this.refreshCollections();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar categoria.')
    });
  }

  protected submitCard(): void {
    if (this.cardForm.invalid) {
      this.message.set('');
      this.error.set('Informe nome, bandeira e os 4 últimos dígitos do cartão.');
      return;
    }

    this.error.set('');
    this.message.set('');

    const request$ = this.editingCardId()
      ? this.financeService.updateCard(this.editingCardId() as number, this.cardForm.getRawValue())
      : this.financeService.createCard(this.cardForm.getRawValue());

    request$.subscribe({
      next: () => {
        const wasEditing = this.editingCardId() !== null;
        this.cancelCardEdit();
        this.message.set(wasEditing ? 'Cartão atualizado.' : 'Cartão adicionado.');
        this.refreshCollections();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar cartão.')
    });
  }

  protected startCardEdit(card: Card): void {
    this.editingCardId.set(card.id);
    this.cardForm.patchValue({
      name: card.name,
      brand: card.brand,
      lastDigits: card.lastDigits,
      credit: card.credit
    });
  }

  protected cancelCardEdit(): void {
    this.editingCardId.set(null);
    this.cardForm.patchValue({ name: '', brand: '', lastDigits: '', credit: true });
  }

  protected startCategoryEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.patchValue({
      name: category.name,
      monthlyLimit: category.monthlyLimit,
      colorHex: category.colorHex,
      iconKey: category.iconKey
    });
  }

  protected cancelCategoryEdit(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.patchValue({
      name: '',
      monthlyLimit: 0,
      colorHex: '#2BB0ED',
      iconKey: 'bookmark'
    });
  }

  protected startExpenseEdit(expense: Expense): void {
    this.editingExpenseId.set(expense.id);
    this.expenseForm.patchValue({
      itemName: expense.itemName,
      categoryId: String(expense.categoryId),
      purchaseDate: expense.purchaseDate,
      amount: Number(expense.amount),
      paymentMethod: expense.paymentMethod,
      cardId: expense.cardId ? String(expense.cardId) : '',
      installmentPurchase: expense.installmentPurchase,
      installmentCount: expense.installmentCount ?? 2,
      installmentValue: Number(expense.installmentValue ?? 0)
    });
  }

  protected cancelExpenseEdit(): void {
    this.editingExpenseId.set(null);
    this.resetExpenseForm();
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

  protected isCardPayment(): boolean {
    const method = this.expenseForm.controls.paymentMethod.value;
    return method === 'CREDIT_CARD' || method === 'DEBIT_CARD';
  }

  protected isInstallment(): boolean {
    return !!this.expenseForm.controls.installmentPurchase.value;
  }

  private resetExpenseForm(): void {
    this.expenseForm.patchValue({
      itemName: '',
      categoryId: '',
      purchaseDate: new Date().toISOString().slice(0, 10),
      amount: 0,
      paymentMethod: this.defaultPayment(),
      cardId: '',
      installmentPurchase: false,
      installmentCount: 2,
      installmentValue: 0
    });
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
    this.financeService.getRecentExpenses().subscribe({
      next: (response) => this.recentExpenses.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar lançamentos.')
    });
    this.financeService.getPaymentMethods().subscribe({
      next: (response) => this.paymentMethods.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar formas de pagamento.')
    });
  }
}