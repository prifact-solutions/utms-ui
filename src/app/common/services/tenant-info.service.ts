import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppSettings } from '../appsettings';

interface TenantInfo {
  name?: string;
  email?: string;
  logo?: string;
  showDemoFeatures?: boolean;
  allowSignIn?: boolean;
  enableUserManagementActions?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TenantInfoService {
  private readonly defaultAppTitle = 'ULMS';
  private readonly defaultEmail = 'ulms.support@upskillair.com';
  private readonly defaultAppLogo = 'assets/images/logo2.svg';
  private info: TenantInfo = {};

  constructor(private http: HttpClient) {}

  async loadInfo(): Promise<void> {
    try {
      this.info = await firstValueFrom(
        this.http.get<TenantInfo>(`${AppSettings.apiUrl}/tenant-info/`),
      );
    } catch {
      this.info = {};
    }
  }

  get appTitle(): string {
    return this.info.name?.trim() || this.defaultAppTitle;
  }

  get appLogo(): string {
    return this.info.logo?.trim() || this.defaultAppLogo;
  } 

  get showDemoFeatures(): boolean {
    return this.info.showDemoFeatures ?? false;
  }

  get allowSignIn(): boolean {
    return this.info.allowSignIn ?? false;
  }

  get enableUserManagementActions(): boolean {
    return this.info.enableUserManagementActions ?? false;
  }
}
