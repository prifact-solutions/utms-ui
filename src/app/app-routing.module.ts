import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { ExploreComponent } from './programs/explore/explore.component';
import { EnrollComponent } from './programs/enroll/enroll.component';
import { LoginComponent } from './utms-auth/login/login.component';
import { DetailsComponent } from './programs/details/details.component';
import { ViewLessonComponent } from './programs/view-lesson/view-lesson.component';
import { ProgramListComponent } from './program-builder/program-list/program-list.component';
import { StaffAuthGuard } from './guards/staffauth.guard';
import { CreateProgramComponent } from './program-builder/create-program/create-program.component';
import { ListModulesComponent } from './program-builder/list-modules/list-modules.component';
import { ListModuleContentComponent } from './program-builder/list-module-content/list-module-content.component';
import { CreateModuleComponent } from './program-builder/create-module/create-module.component';
import { CreateLessonComponent } from './program-builder/create-lesson/create-lesson.component';
import { EditProgramComponent } from './program-builder/edit-program/edit-program.component';
import { EditModuleComponent } from './program-builder/edit-module/edit-module.component';
import { EditLessonComponent } from './program-builder/edit-lesson/edit-lesson.component';
import { OrganizeContentsComponent } from './program-builder/organize-contents/organize-contents.component';
import { CreateExamComponent } from './program-builder/create-exam/create-exam.component';
import { QuestionPapersListComponent } from './program-builder/question-papers/components/question-papers-list/question-papers-list.component';
import { CreateQuestionPaperComponent } from './program-builder/question-papers/components/create-question-paper/create-question-paper.component';
import { DesignQuestionPaperComponent } from './program-builder/question-papers/components/design-question-paper/design-question-paper.component';
import { ExamSuccessComponent } from './programs/exams/exam-success/exam-success.component';
import { TakeExamComponent } from './programs/exams/take-exam/take-exam.component';
import { LandingComponent } from './public/landing/landing.component';
import { DashboardComponent } from './public/dashboard/dashboard.component';
import { HowitworksComponent } from './public/howitworks/howitworks.component';
import { EditExamComponent } from './program-builder/edit-exam/edit-exam.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'explore',
    component: ExploreComponent,
  },
  {
    path: 'howitworks',
    component: HowitworksComponent,
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
    path: 'programs/:program_id/details',
    component: DetailsComponent,
    children: [
      {
        path: 'modules/:module_id/contents/:module_content_id/lesson',
        component: ViewLessonComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'modules/:module_id/contents/:module_content_id/exam',
        component: TakeExamComponent,
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'programs/:program_id/modules/:module_id/contents/:module_content_id/exam-success/:exam_id',
    component: ExamSuccessComponent,
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
    path: 'programs-builder/:program_id/edit',
    component: EditProgramComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules',
    component: ListModulesComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/organize-contents',
    component: OrganizeContentsComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/add',
    component: CreateModuleComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/edit',
    component: EditModuleComponent,
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
    path: 'programs-builder/:program_id/modules/:module_id/lessons/:lesson_id/edit',
    component: EditLessonComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/exams/add',
    component: CreateExamComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/exams/:content_id/edit',
    component: EditExamComponent,
    canActivate: [StaffAuthGuard],
  },
  {
    path: 'programs-builder/:program_id/question-papers',
    component: QuestionPapersListComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/question-papers/add',
    component: CreateQuestionPaperComponent,
    canActivate: [StaffAuthGuard]
  },
  {
    path: 'programs-builder/:program_id/question-papers/:qp_id/design',
    component: DesignQuestionPaperComponent,
    canActivate: [StaffAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    useHash: true,
    onSameUrlNavigation: 'reload',
    scrollPositionRestoration: 'enabled',
    paramsInheritanceStrategy: 'always'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
