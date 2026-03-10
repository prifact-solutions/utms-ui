import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentBase } from 'src/app/common/componentbase';
import { AuthService } from '../../services/auth.service';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.component.html',
  styleUrls: ['./auth-callback.component.scss'],
})
export class AuthCallbackComponent extends ComponentBase {
  constructor(
    private readonly router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    super();
  }

  isLoading = false;
  errorMessage = '';
  private returnUrl: string = '/dashboard';

  ngOnInit() {
    var sub = this.route.queryParams
      .pipe(
        switchMap((params) => {
          if (params['state']) {
            try {
              this.returnUrl = atob(params['state']);
            } catch (e) {
              console.error('Failed to decode state', e);
            }
          }
          const code = params['code'];
          if (code) {
            this.isLoading = true;
            return this.authService.exchangeCodeForToken(code);
          } else {
            return of(null);
          }
        }),
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (error) => {
          this.isLoading = false;
          // Handle different error scenarios
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to the server';
          } else {
            this.errorMessage =
              error.error?.message || 'Login failed. Please try again.';
          }
          console.error('Login error:', error);
        },
      });
    this.registerSubscription(sub);
  }
}
