import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { ExploreComponent } from './programs/explore/explore.component';
import { EnrollComponent } from './programs/enroll/enroll.component';
import { LoginComponent } from './utms-auth/login/login.component';
import { DetailsComponent } from './programs/details/details.component';
import { ViewLessonComponent } from './programs/view-lesson/view-lesson.component';
import { TakeExamComponent } from './programs/take-exam/take-exam.component';
import { ProgramListComponent } from './program-builder/program-list/program-list.component';
import { StaffAuthGuard } from './guards/staffauth.guard';

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
  {
    path: 'programs/:id/details',
    component: DetailsComponent,
    
  },
  {
    path: 'programs/:program_id/modules/:module_id/contents/:module_content_id/lesson',
    component: ViewLessonComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'programs/:program_id/modules/:module_id/contents/:module_content_id/exam',
    component: TakeExamComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'programs-builder',
    component: ProgramListComponent,
    canActivate: [StaffAuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
