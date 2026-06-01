import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Card, Category, Expense, PaymentMethod } from '../../core/models/finance.models';
import { AuthService } from '../../core/services/auth.service';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-expense-entry',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe, RouterLink],
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

          <p class="field-hint warning" *ngIf="isCardPayment() && !cards().length">Cadastre um cartão na página de cartões para selecionar aqui.</p>

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

          <div class="receipt-box">
            <div>
              <strong>Comprovante</strong>
              <p class="field-hint">Opcional. Aceita imagem ou PDF e aparece no relatório.</p>
            </div>
            <label class="receipt-upload">
              <input type="file" accept="image/*,application/pdf" (change)="onReceiptSelected($event)">
              <span class="material-icons-outlined">add_a_photo</span>
              <span>{{ expenseForm.controls.receiptName.value || 'Anexar comprovante' }}</span>
            </label>
            <div class="receipt-preview" *ngIf="expenseForm.controls.receiptName.value">
              <div>
                <strong>{{ expenseForm.controls.receiptName.value }}</strong>
                <small *ngIf="isImageReceipt()">Imagem pronta para o relatório</small>
                <small *ngIf="!isImageReceipt()">Arquivo PDF anexado</small>
              </div>
              <button type="button" class="text-button" (click)="clearReceipt()">Remover</button>
            </div>
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
              <h3 class="section-title">Cadastros rápidos</h3>
              <p class="section-subtitle">Categorias e cartões agora ficam em telas separadas para facilitar a gestão.</p>
            </div>
          </div>
          <div class="manager-links">
            <a routerLink="/categorias" class="manager-link-card">
              <span class="material-icons-outlined">category</span>
              <div>
                <strong>Gerenciar categorias</strong>
                <small>{{ categories().length }} cadastrada(s) para seus lançamentos.</small>
              </div>
            </a>

            <a routerLink="/cartoes" class="manager-link-card">
              <span class="material-icons-outlined">credit_card</span>
              <div>
                <strong>Gerenciar cartões</strong>
                <small>{{ cards().length }} cadastrado(s) para compras no débito e crédito.</small>
              </div>
            </a>
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
                <small *ngIf="expense.receiptName">Comprovante: {{ expense.receiptName }}</small>
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

    .receipt-box {
      display: grid;
      gap: 12px;
      padding: 16px;
      border-radius: 18px;
      background: rgba(20, 33, 61, 0.04);
    }

    .receipt-upload {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px dashed var(--line);
      background: rgba(255, 255, 255, 0.8);
      cursor: pointer;
      color: var(--ink);
    }

    .receipt-upload input {
      display: none;
    }

    .receipt-preview {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.82);
      border: 1px solid rgba(20, 33, 61, 0.08);
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

    .manager-links {
      display: grid;
      gap: 14px;
      margin-top: 18px;
    }

    .manager-link-card {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
      align-items: center;
      padding: 18px;
      border-radius: 20px;
      text-decoration: none;
      color: inherit;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(20, 33, 61, 0.08);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .manager-link-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 30px rgba(20, 33, 61, 0.08);
    }

    .manager-link-card .material-icons-outlined {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: 16px;
      background: rgba(43, 176, 237, 0.12);
      color: var(--primary-dark);
    }

    .manager-link-card small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
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
    installmentValue: 0,
    receiptName: '',
    receiptDataUrl: ''
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
      installmentValue: this.isInstallment() ? Number(this.expenseForm.controls.installmentValue.value) : null,
      receiptName: this.expenseForm.controls.receiptName.value || null,
      receiptDataUrl: this.expenseForm.controls.receiptDataUrl.value || null
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
      installmentValue: Number(expense.installmentValue ?? 0),
      receiptName: expense.receiptName ?? '',
      receiptDataUrl: expense.receiptDataUrl ?? ''
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

  protected onReceiptSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.error.set('O comprovante deve ter no máximo 3 MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.expenseForm.patchValue({
        receiptName: file.name,
        receiptDataUrl: typeof reader.result === 'string' ? reader.result : ''
      });
      this.error.set('');
    };
    reader.onerror = () => this.error.set('Nao foi possivel ler o comprovante.');
    reader.readAsDataURL(file);
    input.value = '';
  }

  protected clearReceipt(): void {
    this.expenseForm.patchValue({ receiptName: '', receiptDataUrl: '' });
  }

  protected isImageReceipt(): boolean {
    return (this.expenseForm.controls.receiptDataUrl.value || '').startsWith('data:image/');
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
      installmentValue: 0,
      receiptName: '',
      receiptDataUrl: ''
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