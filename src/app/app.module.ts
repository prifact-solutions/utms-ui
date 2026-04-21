import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProgramsModule } from './programs/programs.module';
import { UtmsAuthModule } from './utms-auth/utms-auth.module';
import { ProgramBuilderModule } from './program-builder/program-builder.module';
import { SharedModule } from './shared/shared.module';
import { LandingComponent } from './public/landing/landing.component';
import { DashboardComponent } from './public/dashboard/dashboard.component';
import { HowitworksComponent } from './public/howitworks/howitworks.component';
import { AchievementsComponent } from './public/achievements/achievements.component';
import { ProfileComponent } from './public/profile/profile.component';
import { SettingsComponent } from './public/settings/settings.component';
import { NotesComponent } from './public/notes/components/notes/notes.component';
import { TenantInfoService } from './common/services/tenant-info.service';

export function initializeTenantInfo(tenantInfoService: TenantInfoService): () => Promise<void> {
  return () => tenantInfoService.loadInfo();
}

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    DashboardComponent,
    HowitworksComponent,
    NotesComponent,
    AchievementsComponent,
    ProfileComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    ProgramsModule,
    ProgramBuilderModule,
    UtmsAuthModule,
    SharedModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTenantInfo,
      deps: [TenantInfoService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
