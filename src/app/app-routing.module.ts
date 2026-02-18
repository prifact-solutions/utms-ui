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
import { CreateProgramComponent } from './program-builder/create-program/create-program.component';
import { ListModulesComponent } from './program-builder/list-modules/list-modules.component';
import { ListModuleContentComponent } from './program-builder/list-module-content/list-module-content.component';
import { CreateModuleComponent } from './program-builder/create-module/create-module.component';
import { CreateLessonComponent } from './program-builder/create-lesson/create-lesson.component';
import { CreateExamComponent } from './program-builder/create-exam/create-exam.component';

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
  {
    path: 'programs-builder/add',
    component: CreateProgramComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules',
    component: ListModulesComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/add',
    component: CreateModuleComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/lessons',
    component: ListModuleContentComponent,
    canActivate: [StaffAuthGuard]
  },
    {
    path: 'programs-builder/:program_id/modules/:module_id/lessons/add',
    component: CreateLessonComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/exams/add',
    component: CreateExamComponent,
    canActivate: [StaffAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
