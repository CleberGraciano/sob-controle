import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/finance.models';

const STORAGE_KEY = 'sob-controle-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthResponse | null>(this.restore());

  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(tap((response) => this.persist(response)));
  }

  register(payload: { fullName: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(tap((response) => this.persist(response)));
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
    void this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.session()?.token;
  }

  currentUser(): AuthResponse | null {
    return this.session();
  }

  token(): string | null {
    return this.session()?.token ?? null;
  }

  private persist(response: AuthResponse): void {
    this.session.set(response);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
  }

  private restore(): AuthResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  }
}