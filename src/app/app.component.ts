import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/utms-auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'utms-public';
  isAuthenticated = false;
  private authSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.updateBodyClass();

    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.updateBodyClass();
    });
  }

  private updateBodyClass(): void {
    if (this.isAuthenticated) {
      this.renderer.addClass(document.body, 'user-signed-in');
    } else {
      this.renderer.removeClass(document.body, 'user-signed-in');
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
