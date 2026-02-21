import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { Utils } from 'src/app/common/utils';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isStaff = false;
  private authSubscription: Subscription | null = null;

  userName = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.updateAuthStatus();
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateAuthStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const tokenData = Utils.decodeAuthToken();
      this.isStaff = tokenData.is_staff || false;
      this.userName = tokenData.username || 'User';
      this.userEmail = tokenData.email || '';
    } else {
      this.isStaff = false;
      this.userName = '';
      this.userEmail = '';
    }
  }

  getUserInitials(): string {
    if (!this.userName) return 'U';
    return this.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}