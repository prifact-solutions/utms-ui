import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private returnUrl: string = '/';

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  loginWithGoogle() {
    // TODO: Implement Google OAuth login
    // You'll need to integrate Google Sign-In SDK
    console.log('Google login clicked');
    // Temporary redirect for testing
    this.setAuthToken();
    this.router.navigateByUrl(this.returnUrl);
  }

  private setAuthToken() {
    // Temporary auth token - replace with actual API call
    localStorage.setItem('auth_token', 'temp_token_' + Date.now());
  }
}
