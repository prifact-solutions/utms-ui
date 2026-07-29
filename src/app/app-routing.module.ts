import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { ExploreComponent } from './programs/explore/explore.component';
import { EnrollComponent } from './programs/enroll/enroll.component';
import { LoginComponent } from './utms-auth/components/login/login.component';
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
import { TakeExamComponent } from './programs/exams/take-exam/take-exam.component';
import { LandingComponent } from './public/landing/landing.component';
import { DashboardComponent } from './public/dashboard/dashboard.component';
import { HowitworksComponent } from './public/howitworks/howitworks.component';
import { EditExamComponent } from './program-builder/edit-exam/edit-exam.component';
import { AuthCallbackComponent } from './utms-auth/components/auth-callback/auth-callback.component';
import { ProgramReportComponent } from './program-builder/program-report/program-report.component';
import { ReportComponent } from './program-builder/report/report.component';
import { AchievementsComponent } from './public/achievements/achievements.component';
import { ProfileComponent } from './public/profile/profile.component';
import { SettingsComponent } from './public/settings/settings.component';
import { ManageUsersComponent } from './program-builder/manage-users/manage-users.component';
import { ManageCourseComponent } from './program-builder/manage-course/manage-course.component';
import { ExamComponent } from './programs/exams/exam/exam.component';
import { ExamResultComponent } from './programs/exams/exam-result/exam-result.component';
import { NotesComponent } from './public/notes/components/notes/notes.component';
import { CourseCompletedComponent } from './programs/course-completed/course-completed.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
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
    path: 'my-notes',
    component: NotesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'achievements',
    component: AchievementsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard],
  },
  // {
  //   path: 'login',
  //   component: LoginComponent,
  // },
  {
    path: 'programs/:id/enroll',
    component: EnrollComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'programs/:program_id/details',
    component: DetailsComponent,
    children: [
      {
        path: 'modules/:module_id/contents/:module_content_id/lesson',
        component: ViewLessonComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'modules/:module_id/contents/:module_content_id/exam',
        component: ExamComponent,
        canActivate: [AuthGuard],
        children: [
          {
            path: 'exam-result/:exam_id',
            component: ExamResultComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'take-exam/:exam_id',
            component: TakeExamComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'completed',
        component: CourseCompletedComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'programs-builder',
    component: ProgramListComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/manage',
    component: ManageCourseComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/add',
    component: CreateProgramComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/edit',
    component: EditProgramComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'reports',
    component: ReportComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'reports/:program_id',
    component: ProgramReportComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules',
    component: ListModulesComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/organize-contents',
    component: OrganizeContentsComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/add',
    component: CreateModuleComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/edit',
    component: EditModuleComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/lessons',
    component: ListModuleContentComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/lessons/add',
    component: CreateLessonComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/lessons/:lesson_id/edit',
    component: EditLessonComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/exams/add',
    component: CreateExamComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/modules/:module_id/exams/:content_id/edit',
    component: EditExamComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/question-papers',
    component: QuestionPapersListComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/question-papers/add',
    component: CreateQuestionPaperComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'programs-builder/:program_id/question-papers/:qp_id/design',
    component: DesignQuestionPaperComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN', 'INSTRUCTOR'] }
  },
  {
    path: 'manage-users',
    component: ManageUsersComponent,
    canActivate: [StaffAuthGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'auth-callback',
    component: AuthCallbackComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: false,
      useHash: true,
      onSameUrlNavigation: 'reload',
      scrollPositionRestoration: 'enabled',
      paramsInheritanceStrategy: 'always',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
