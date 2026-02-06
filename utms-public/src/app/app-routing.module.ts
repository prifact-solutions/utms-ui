import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { ExploreComponent } from './programs/explore/explore.component';
import { EnrollComponent } from './programs/enroll/enroll.component';
import { LoginComponent } from './utms-auth/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: ExploreComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'programs/:id/enroll',
    component: EnrollComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
