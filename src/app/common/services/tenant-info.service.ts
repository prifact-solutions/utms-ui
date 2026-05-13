import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppSettings } from '../appsettings';

interface TenantInfo {
  appTitle?: string;
  appEmail?: string;
  appLogo?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TenantInfoService {
  private readonly defaultAppTitle = 'UTMS';
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
    return this.info.appTitle?.trim() || this.defaultAppTitle;
  }

  get appLogo(): string {
    return this.info.appLogo?.trim() || this.defaultAppLogo;
  } 
}
