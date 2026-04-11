import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, from, firstValueFrom } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { AppSettings } from 'src/app/common/appsettings';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  anonymousUrls: Array<string> = [`${AppSettings.apiUrl}/auth/keycloak-config`];

  /** Coalesces concurrent 401s into a single refresh request. */
  private refreshPromise: Promise<string> | null = null;

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (
      token &&
      !this.anonymousUrls.includes(request.url) &&
      !request.url.includes('s3.amazonaws.com') &&
      !this.isAuthRefreshUrl(request.url)
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401) {
          return throwError(() => error);
        }

        if (this.isAuthRefreshUrl(request.url)) {
          this.authService.keycloakLogout();
          return throwError(() => error);
        }

        if (!this.shouldAttemptRefresh(request)) {
          return throwError(() => error);
        }

        if (!this.authService.getRefreshToken()) {
          this.authService.keycloakLogout();
          return throwError(() => error);
        }

        return this.refreshAccessTokenOnce().pipe(
          switchMap((newAccess) =>
            next.handle(this.cloneRequestWithAuth(request, newAccess)),
          ),
          catchError((refreshErr) => {
            this.authService.keycloakLogout();
            return throwError(() => refreshErr);
          }),
        );
      }),
    );
  }

  private cloneRequestWithAuth(
    request: HttpRequest<unknown>,
    accessToken: string,
  ): HttpRequest<unknown> {
    if (
      this.anonymousUrls.includes(request.url) ||
      request.url.includes('s3.amazonaws.com') ||
      this.isAuthRefreshUrl(request.url)
    ) {
      return request;
    }
    return request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    });
  }

  private refreshAccessTokenOnce(): Observable<string> {
    if (!this.refreshPromise) {
      const p = firstValueFrom(
        this.authService.refreshAccessToken().pipe(
          map(() => {
            const t = this.authService.getToken();
            if (!t) {
              throw new Error('Missing access token after refresh');
            }
            return t;
          }),
        ),
      ).finally(() => {
        if (this.refreshPromise === p) {
          this.refreshPromise = null;
        }
      });
      this.refreshPromise = p;
    }
    return from(this.refreshPromise);
  }

  private isAuthRefreshUrl(url: string): boolean {
    return url.includes('/auth/refresh');
  }

  private shouldAttemptRefresh(request: HttpRequest<unknown>): boolean {
    const url = request.url;
    if (
      url.includes('/auth/login') ||
      url.includes('/auth/exchange') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/keycloak-config') ||
      url.includes('s3.amazonaws.com')
    ) {
      return false;
    }
    return true;
  }
}
