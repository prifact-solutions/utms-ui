import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';
import { Utils } from 'src/app/common/utils';
import { ProgramsService } from 'src/app/programs/services/programs.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  isStaff = false;
  private authSubscription: Subscription | null = null;

  userName = '';
  userEmail = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private programsService: ProgramsService,
  ) {}

  ngOnInit(): void {
    this.updateAuthStatus();
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateAuthStatus();
    });

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        let activeRoute = this.route.root;
        while (activeRoute.firstChild) {
          activeRoute = activeRoute.firstChild;
        }
        const programId = activeRoute.snapshot.paramMap.get('program_id');
        if (programId) {
          this.programsService.setProgramId(programId);
        }
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
    return this.userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
