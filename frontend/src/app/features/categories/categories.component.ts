import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../core/models/finance.models';
import { FinanceService } from '../../core/services/finance.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
    <div class="categories-grid">
      <section class="glass-card category-form-card">
        <div class="section-head">
          <div>
            <h3 class="section-title">{{ editingCategoryId() ? 'Editar categoria' : 'Categorias' }}</h3>
            <p class="section-subtitle">{{ editingSystemCategory() ? 'Categorias padrão permitem alterar somente o limite mensal.' : 'Cadastre categorias com limite mensal, cor e ícone.' }}</p>
          </div>
          <span class="chip">Organização do orçamento</span>
        </div>

        <div *ngIf="message()" class="feedback success">{{ message() }}</div>
        <div *ngIf="error()" class="feedback error">{{ error() }}</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            Nome da categoria
            <input type="text" formControlName="name" placeholder="Ex.: Educação">
          </label>

          <div class="field-row">
            <label>
              Limite mensal
              <input type="number" min="0" step="0.01" formControlName="monthlyLimit" placeholder="500.00">
            </label>

            <label class="color-picker">
              <span>Cor</span>
              <div class="color-picker-field">
                <input type="color" formControlName="colorHex">
                <strong [style.color]="form.controls.colorHex.value">Escolher cor</strong>
              </div>
            </label>
          </div>

          <label>
            Ícone
            <input type="text" formControlName="iconKey" placeholder="bookmark">
          </label>

          <div class="button-row">
            <button type="submit">{{ editingCategoryId() ? 'Salvar categoria' : 'Adicionar categoria' }}</button>
            <button type="button" class="secondary-button" *ngIf="editingCategoryId()" (click)="cancelEdit()">Cancelar edição</button>
          </div>
        </form>
      </section>

      <section class="glass-card category-list-card">
        <div class="section-head compact-head">
          <div>
            <h3 class="section-title">Categorias cadastradas</h3>
            <p class="section-subtitle">Categorias padrão aceitam ajuste apenas no limite mensal.</p>
          </div>
        </div>

        <div class="list-stack" *ngIf="categories().length; else emptyState">
          <article class="mini-item" *ngFor="let category of categories()">
            <div class="mini-item-main">
              <span class="color-dot" [style.background]="category.colorHex"></span>
              <div>
                <strong>{{ category.name }}</strong>
                <small>Limite {{ category.monthlyLimit | currency:'BRL' }} • Ícone {{ category.iconKey }}</small>
                <small *ngIf="category.systemDefined">Categoria padrão do sistema</small>
              </div>
            </div>
            <div class="item-actions" *ngIf="!category.systemDefined; else lockedCategory">
              <button type="button" class="text-button" (click)="startEdit(category)">Editar</button>
              <button type="button" class="text-button danger-button" (click)="confirmDelete(category)">Excluir</button>
            </div>
            <ng-template #lockedCategory>
              <div class="item-actions">
                <button type="button" class="text-button" (click)="startEdit(category)">Editar limite</button>
                <span class="locked-badge">Exclusão bloqueada</span>
              </div>
            </ng-template>
          </article>
        </div>

        <ng-template #emptyState>
          <p class="section-subtitle">Nenhuma categoria cadastrada ainda.</p>
        </ng-template>
      </section>
    </div>
  `,
  styles: [`
    .categories-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .category-form-card,
    .category-list-card {
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

    .danger-button {
      color: #9f1239;
      border-color: rgba(159, 18, 57, 0.2);
    }

    .item-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
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
      padding: 0;
      border: none;
      border-radius: 12px;
      background: transparent;
      overflow: hidden;
      cursor: pointer;
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

    .mini-item-main {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .color-dot {
      width: 16px;
      height: 16px;
      border-radius: 999px;
      box-shadow: 0 0 0 4px rgba(20, 33, 61, 0.06);
      flex: none;
    }

    .mini-item small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
    }

    .locked-badge {
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(20, 33, 61, 0.06);
      color: var(--muted);
      font-weight: 700;
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
      .categories-grid,
      .field-row,
      .button-row,
      .mini-item {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoriesComponent implements OnInit {
  protected readonly categories = signal<Category[]>([]);
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingSystemCategory = signal(false);
  protected readonly message = signal('');
  protected readonly error = signal('');

  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    monthlyLimit: 0,
    colorHex: '#2BB0ED',
    iconKey: 'bookmark'
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly financeService: FinanceService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Preencha os campos obrigatórios da categoria.');
      return;
    }

    const editingCategory = this.categories().find((category) => category.id === this.editingCategoryId()) ?? null;
    const payload = {
      name: this.editingSystemCategory() && editingCategory ? editingCategory.name : this.form.controls.name.value,
      monthlyLimit: Number(this.form.controls.monthlyLimit.value),
      colorHex: this.editingSystemCategory() && editingCategory ? editingCategory.colorHex : this.form.controls.colorHex.value,
      iconKey: this.editingSystemCategory() && editingCategory ? editingCategory.iconKey : this.form.controls.iconKey.value
    };

    const request$ = this.editingCategoryId()
      ? this.financeService.updateCategory(this.editingCategoryId() as number, payload)
      : this.financeService.createCategory(payload);

    this.error.set('');
    this.message.set('');

    request$.subscribe({
      next: () => {
        this.message.set(this.editingCategoryId() ? 'Categoria atualizada.' : 'Categoria adicionada.');
        this.cancelEdit();
        this.loadCategories();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao salvar categoria.')
    });
  }

  protected startEdit(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.editingSystemCategory.set(category.systemDefined);
    this.form.patchValue({
      name: category.name,
      monthlyLimit: category.monthlyLimit,
      colorHex: category.colorHex,
      iconKey: category.iconKey
    });

    if (category.systemDefined) {
      this.form.controls.name.disable();
      this.form.controls.colorHex.disable();
      this.form.controls.iconKey.disable();
      this.message.set('Para categorias padrão, apenas o limite mensal pode ser alterado.');
    } else {
      this.form.controls.name.enable();
      this.form.controls.colorHex.enable();
      this.form.controls.iconKey.enable();
      this.message.set('');
    }

    this.error.set('');
  }

  protected cancelEdit(): void {
    this.editingCategoryId.set(null);
    this.editingSystemCategory.set(false);
    this.form.controls.name.enable();
    this.form.controls.colorHex.enable();
    this.form.controls.iconKey.enable();
    this.form.patchValue({
      name: '',
      monthlyLimit: 0,
      colorHex: '#2BB0ED',
      iconKey: 'bookmark'
    });
  }

  protected confirmDelete(category: Category): void {
    if (category.systemDefined) {
      this.error.set('As categorias padrao do sistema nao podem ser excluidas.');
      return;
    }

    const confirmed = window.confirm(`Excluir a categoria "${category.name}"? Essa ação não pode ser desfeita.`);
    if (!confirmed) {
      return;
    }

    this.error.set('');
    this.message.set('');

    this.financeService.deleteCategory(category.id).subscribe({
      next: () => {
        if (this.editingCategoryId() === category.id) {
          this.cancelEdit();
        }
        this.message.set('Categoria excluida.');
        this.loadCategories();
      },
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao excluir categoria.')
    });
  }

  private loadCategories(): void {
    this.financeService.getCategories().subscribe({
      next: (response) => this.categories.set(response),
      error: (error) => this.error.set(error.error?.message ?? 'Falha ao carregar categorias.')
    });
  }
}