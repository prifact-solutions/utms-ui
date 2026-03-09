import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AppSettings } from 'src/app/common/appsettings';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<string | null>(
    this.getToken(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${AppSettings.apiUrl}/auth/login/`, credentials)
      .pipe(
        tap((response) => {
          this.setToken(response.access);
        }),
      );
  }

  /**
   * Logout and clear token
   */
  logout(): void {
    this.clearToken();
  }

  /**
   * Set JWT token in localStorage
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.currentUserSubject.next(token);
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Clear JWT token from localStorage
   */
  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  public exchangeCodeForToken(code: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${AppSettings.apiUrl}/auth/exchange/`, {
        code,
        redirect_uri: 'http://localhost:4200/auth-callback',
      })
      .pipe(
        tap((response) => {
          this.setToken(response.access);
        }),
      );
  }

  public keycloakLogin() {
    const redirectUri = `${window.location.origin}/auth-callback`;
    const loginUrl =
      `https://login.dev.upskillm.com/realms/UpSkillCRS-Dev/protocol/openid-connect/auth` +
      `?client_id=django-server` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid`;

    window.location.href = loginUrl;
  }

  public keycloakLogout() {
    this.clearToken();

    const redirectUri = `${encodeURIComponent(window.location.origin)}`;
    const logoutUrl =
      `https://login.dev.upskillm.com/realms/UpSkillCRS-Dev/protocol/openid-connect/logout` +
      `?client_id=django-server` +
      `&post_logout_redirect_uri=${redirectUri}`;

    window.location.href = logoutUrl;
  }
}
