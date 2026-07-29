import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { Utils } from '../common/utils';
import { AuthService } from '../utms-auth/services/auth.service';
import { UserRoleName, UserRoles } from '../users/models/role.model';

@Injectable({
  providedIn: 'root',
})
export class StaffAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const isAuthenticated = this.isUserAuthenticated();
    const allowedRoles = (route.data['roles'] as UserRoleName[]) ?? [
      UserRoles.ADMIN,
      UserRoles.INSTRUCTOR,
    ];
    
    if (isAuthenticated && Utils.hasAnyRole(...allowedRoles)) {
      return true;
    } else {
      this.authService.keycloakLogin(state.url);
      return false;
    }
  }

  private isUserAuthenticated(): boolean {
    // Check if user is authenticated (e.g., from localStorage, session, etc.)
    const token = localStorage.getItem('auth_token');
    if (token) {
      return true;
    }
    return false;
  }
}
