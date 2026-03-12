import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProgramListComponent } from './program-list/program-list.component';
import { CreateProgramComponent } from './create-program/create-program.component';
import { CreateModuleComponent } from './create-module/create-module.component';
import { CreateLessonComponent } from './create-lesson/create-lesson.component';
import { RouterModule } from '@angular/router';
import { ListModulesComponent } from './list-modules/list-modules.component';
import { ListModuleContentComponent } from './list-module-content/list-module-content.component';
import { EditProgramComponent } from './edit-program/edit-program.component';
import { EditModuleComponent } from './edit-module/edit-module.component';
import { EditLessonComponent } from './edit-lesson/edit-lesson.component';
import { OrganizeContentsComponent } from './organize-contents/organize-contents.component';
import { CreateExamComponent } from './create-exam/create-exam.component';
import { QuestionPapersModule } from './question-papers/question-papers.module';
import { EditExamComponent } from './edit-exam/edit-exam.component';
import { SharedModule } from '../shared/shared.module';
import { ProgramReportComponent } from './program-report/program-report.component';
@NgModule({
  declarations: [
    ProgramListComponent,
    CreateProgramComponent,
    CreateModuleComponent,
    CreateLessonComponent,
    ListModulesComponent,
    ListModuleContentComponent,
    EditProgramComponent,
    EditModuleComponent,
    EditLessonComponent,
    OrganizeContentsComponent,
    CreateExamComponent,
    EditExamComponent,
    ProgramReportComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    QuestionPapersModule,
    SharedModule
  ]
})
export class ProgramBuilderModule { }
