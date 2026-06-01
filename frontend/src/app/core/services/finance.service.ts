import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminSettings, Card, Category, DashboardData, Expense, MonthlyReport, PaymentMethod } from '../models/finance.models';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(year?: number, month?: number): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard`, {
      params: this.buildParams(year, month)
    });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`);
  }

  createCategory(payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(`${environment.apiUrl}/categories`, payload);
  }

  updateCategory(categoryId: number, payload: Omit<Category, 'id'>): Observable<Category> {
    return this.http.put<Category>(`${environment.apiUrl}/categories/${categoryId}`, payload);
  }

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiUrl}/cards`);
  }

  createCard(payload: Omit<Card, 'id'>): Observable<Card> {
    return this.http.post<Card>(`${environment.apiUrl}/cards`, payload);
  }

  updateCard(cardId: number, payload: Omit<Card, 'id'>): Observable<Card> {
    return this.http.put<Card>(`${environment.apiUrl}/cards/${cardId}`, payload);
  }

  getRecentExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${environment.apiUrl}/expenses/recent`);
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${environment.apiUrl}/expenses/payment-methods`);
  }

  createExpense(payload: Record<string, unknown>): Observable<Expense> {
    return this.http.post<Expense>(`${environment.apiUrl}/expenses`, payload);
  }

  updateExpense(expenseId: number, payload: Record<string, unknown>): Observable<Expense> {
    return this.http.put<Expense>(`${environment.apiUrl}/expenses/${expenseId}`, payload);
  }

  getMonthlyReport(year?: number, month?: number): Observable<MonthlyReport> {
    return this.http.get<MonthlyReport>(`${environment.apiUrl}/reports/monthly`, {
      params: this.buildParams(year, month)
    });
  }

  sendMonthlyReportEmail(payload: { reference: string; fileName: string; pdfBase64: string }): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/reports/email`, payload);
  }

  getAdminSettings(): Observable<AdminSettings> {
    return this.http.get<AdminSettings>(`${environment.apiUrl}/admin/settings`);
  }

  updateAdminSettings(payload: Record<string, unknown>): Observable<AdminSettings> {
    return this.http.put<AdminSettings>(`${environment.apiUrl}/admin/settings`, payload);
  }

  private buildParams(year?: number, month?: number): Record<string, string> {
    const params: Record<string, string> = {};
    if (year != null) {
      params['year'] = String(year);
    }
    if (month != null) {
      params['month'] = String(month);
    }
    return params;
  }
}