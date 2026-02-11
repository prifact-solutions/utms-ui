import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreComponent } from './explore/explore.component';
import { EnrollComponent } from './enroll/enroll.component';
import { DetailsComponent } from './details/details.component';
import { ViewLessonComponent } from './view-lesson/view-lesson.component';
import { TakeExamComponent } from './take-exam/take-exam.component';
import { FileViewerModule } from '../common/file-viewer/file-viewer.module';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ExploreComponent,
    EnrollComponent,
    DetailsComponent,
    ViewLessonComponent,
    TakeExamComponent
  ],
  imports: [
    CommonModule, FileViewerModule, RouterModule
  ],
  exports: [ExploreComponent]
})
export class ProgramsModule { }
