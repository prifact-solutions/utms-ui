import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AppSettings } from '../appsettings';

interface TenantInfo {
  appTitle?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TenantInfoService {
  private readonly defaultAppTitle = 'UTMS';
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
}
