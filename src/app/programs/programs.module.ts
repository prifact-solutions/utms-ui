import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreComponent } from './explore/explore.component';
import { EnrollComponent } from './enroll/enroll.component';
import { DetailsComponent } from './details/details.component';
import { ViewLessonComponent } from './view-lesson/view-lesson.component';
import { FileViewerModule } from '../common/file-viewer/file-viewer.module';
import { RouterModule } from '@angular/router';
import { AttemptModule, FormBuilderBackendService } from 'form-builder';
import { ExamBackendService } from '../shared/services/exam-backend.service';
import { ExamSuccessComponent } from './exams/exam-success/exam-success.component';
import { TakeExamComponent } from './exams/take-exam/take-exam.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ExploreComponent,
    EnrollComponent,
    DetailsComponent,
    ViewLessonComponent,
    TakeExamComponent,
    ExamSuccessComponent,
  ],
  imports: [CommonModule, FormsModule, FileViewerModule, RouterModule, AttemptModule, SharedModule],
  providers: [
    { provide: FormBuilderBackendService, useClass: ExamBackendService },
  ],
  exports: [ExploreComponent],
})
export class ProgramsModule { }
