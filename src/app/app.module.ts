import { NgModule } from '@angular/core';
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
import { NotesComponent } from './public/notes/notes.component';
import { AchievementsComponent } from './public/achievements/achievements.component';
import { ProfileComponent } from './public/profile/profile.component';
import { SettingsComponent } from './public/settings/settings.component';

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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
