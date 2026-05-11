import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExploreComponent } from './explore/explore.component';
import { EnrollComponent } from './enroll/enroll.component';
import { DetailsComponent } from './details/details.component';
import { ViewLessonComponent } from './view-lesson/view-lesson.component';
import { FileViewerModule } from '../common/file-viewer/file-viewer.module';
import { RouterModule } from '@angular/router';
import { FormBuilderBackendService } from '../shared/form-builder/lib/services/form-builder-backend.service';
import { ExamBackendService } from '../shared/services/exam-backend.service';
import { TakeExamComponent } from './exams/take-exam/take-exam.component';
import { SharedModule } from '../shared/shared.module';
import { ExamComponent } from './exams/exam/exam.component';
import { ExamResultComponent } from './exams/exam-result/exam-result.component';

@NgModule({
  declarations: [
    ExploreComponent,
    EnrollComponent,
    DetailsComponent,
    ViewLessonComponent,
    TakeExamComponent,
    ExamComponent,
    ExamResultComponent,
  ],
  imports: [CommonModule, FormsModule, FileViewerModule, RouterModule, SharedModule],
  providers: [
    { provide: FormBuilderBackendService, useClass: ExamBackendService },
  ],
  exports: [ExploreComponent],
})
export class ProgramsModule { }
