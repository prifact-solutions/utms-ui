import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { first, switchMap, tap } from 'rxjs/operators';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';
import { AppSettings } from 'src/app/common/appsettings';
import { KeycloakConfig } from '../models/keycloak-config.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'auth_refresh_token';
  private readonly httpWithoutInterceptors: HttpClient;
  private currentUserSubject = new BehaviorSubject<string | null>(
    this.getToken(),
  );
  public currentUser$ = this.currentUserSubject.asObservable();
  private keycloakConfig$!: Observable<KeycloakConfig>;
  private isLoggingOut = false;
  constructor(
    private http: HttpClient,
    httpBackend: HttpBackend,
  ) {
    this.httpWithoutInterceptors = new HttpClient(httpBackend);
  }

  /**
   * Login with username and password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${AppSettings.apiUrl}/auth/login/`, credentials)
      .pipe(
        tap((response) => {
          this.persistAuthTokens(response.access, response.refresh);
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
   * Set JWT access (and optional refresh) in localStorage
   */
  private persistAuthTokens(access: string, refresh?: string | null): void {
    localStorage.setItem(this.tokenKey, access);
    if (refresh) {
      localStorage.setItem(this.refreshTokenKey, refresh);
    }
    this.currentUserSubject.next(access);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
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
    localStorage.removeItem(this.refreshTokenKey);
    this.currentUserSubject.next(null);
  }

  /**
   * Exchange refresh token for new access + refresh. Uses HttpClient without interceptors.
   */
  refreshAccessToken(): Observable<LoginResponse> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.httpWithoutInterceptors
      .post<LoginResponse>(`${AppSettings.apiUrl}/auth/refresh/`, {
        refresh,
      })
      .pipe(
        tap((response) => {
          this.persistAuthTokens(response.access, response.refresh);
        }),
      );
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
        redirect_uri: `${this.getKeyCloakLoginRedirectUrl()}`,
      })
      .pipe(
        tap((response) => {
          this.persistAuthTokens(response.access, response.refresh);
          localStorage.setItem('id_token', response.id_token);
        }),
      );
  }

  public exchangeLaunchToken(launchToken: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${AppSettings.apiUrl}/auth/launch-exchange/`, {
        launch_token: launchToken,
      })
      .pipe(
        tap((response) => {
          this.persistAuthTokens(response.access, response.refresh);
        }),
      );
  }

  public sendInvite(
    email: string,
    isStaffAccount: boolean = false,
    firstName: string,
    lastName?: string,
  ): Observable<string> {
    return this.http.post<string>(`${AppSettings.apiUrl}/auth/invite-user/`, {
      email,
      redirectUri: `${this.getKeyCloakLoginRedirectUrl()}`,
      isStaffAccount: isStaffAccount,
      firstName: firstName,
      lastName: lastName,
    });
  }

  getKeycloakConfig$(): Observable<KeycloakConfig> {
    if (!this.keycloakConfig$) {
      this.keycloakConfig$ = this.http.get<KeycloakConfig>(
        `${AppSettings.apiUrl}/auth/keycloak-config`,
      );
    }
    return this.keycloakConfig$;
  }

  public keycloakLogin(returnUrl?: string) {
    this.getKeycloakConfig$()
      .pipe(first())
      .subscribe((config) => {
        let loginUrl =
          `${config.server_url}/realms/${config.realm_name}/protocol/openid-connect/auth` +
          `?client_id=${config.client_id}` +
          `&redirect_uri=${encodeURIComponent(this.getKeyCloakLoginRedirectUrl())}` +
          `&response_type=code` +
          `&scope=openid`;

        if (returnUrl) {
          loginUrl += `&state=` + btoa(returnUrl);
        }

        window.location.href = loginUrl;
      });
    // let loginUrl =
    //   `https://login.dev.upskillm.com/realms/UpSkillCRS-Dev/protocol/openid-connect/auth` +
    //   `?client_id=django-server` +
    //   `&redirect_uri=${encodeURIComponent(this.getKeyCloakLoginRedirectUrl())}` +
    //   `&response_type=code` +
    //   `&scope=openid`;

    // if (returnUrl) {
    //   loginUrl += `&state=` + btoa(returnUrl);
    // }
    // if (isSilentLogin) {
    //   loginUrl += '&prompt=none';
    // }
    // // if(isSilentLogin){
    // // window.location.href = loginUrl;
    // // }
    // // return;
    // window.location.href = loginUrl;
  }

  public keycloakLogout() {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    const redirectUrl = window.location.href.split('#')[0];
    const idToken = localStorage.getItem('id_token');
    this.getKeycloakConfig$()
      .pipe(first())
      .subscribe((config) => {
        let logoutUrl =
          `${config.server_url}/realms/${config.realm_name}/protocol/openid-connect/logout` +
          `?client_id=${config.client_id}` +
          `&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;

        if (idToken) {
          logoutUrl = logoutUrl + `&id_token_hint=${idToken}`;
        }
        this.clearToken();
        localStorage.removeItem('id_token');

        window.location.href = logoutUrl;
      });
    // let logoutUrl =
    //   `https://login.dev.upskillm.com/realms/UpSkillCRS-Dev/protocol/openid-connect/logout` +
    //   `?client_id=django-server` +
    //   `&post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;

    // if (idToken) {
    //   logoutUrl = logoutUrl + `&id_token_hint=${idToken}`;
    // }
    // this.clearToken();
    // localStorage.removeItem('id_token');

    // window.location.href = logoutUrl;
  }

  private getKeyCloakLoginUrl() {
    return this.getKeycloakConfig$().pipe(
      first(),
      switchMap((config) => {
        let loginUrl =
          `${config.server_url}/realms/${config.realm_name}/protocol/openid-connect/auth` +
          `?client_id=${config.client_id}` +
          `&redirect_uri=${encodeURIComponent(this.getKeyCloakLoginRedirectUrl())}` +
          `&response_type=code` +
          `&scope=openid`;

        return of(loginUrl);
      }),
    );
  }

  private getKeyCloakLoginRedirectUrl() {
    const baseUrl = window.location.href.split('#')[0];
    let redirectUrl;
    if (baseUrl.includes('/index.html')) {
      redirectUrl = baseUrl.replace('/index.html', '/assets/redirect.html');
    } else {
      const slicedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      redirectUrl = slicedBase + '/assets/redirect.html';
    }

    return redirectUrl;
  }
}
