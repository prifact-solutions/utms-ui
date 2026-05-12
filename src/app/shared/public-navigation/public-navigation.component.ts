import { Component, HostListener } from '@angular/core';
import { TenantInfoService } from 'src/app/common/services/tenant-info.service';
import { AuthService } from 'src/app/utms-auth/services/auth.service';

@Component({
  selector: 'app-public-navigation',
  templateUrl: './public-navigation.component.html',
  styleUrls: ['./public-navigation.component.scss'],
})
export class PublicNavigationComponent {
  isScrolled = false;
  constructor(
    private authService: AuthService,
    private tenantInfo: TenantInfoService,
  ) {}
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  get appLogoPath(): string {
    return this.tenantInfo.appLogo;
  }

  public signIn($event: any) {
    this.authService.keycloakLogin();
  }
}
