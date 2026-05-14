import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormEvaluateComponent } from './form-evaluate/form-evaluate.component';
import { MarkDisplayModule } from '../components/mark-display/mark-display.module';
import { MarksSummaryComponent } from './marks-summary/marks-summary.component';
import { StudentSummaryComponent } from './student-summary/student-summary.component';
import { SectionEvaluateComponent } from './elements/section-evaluate/section-evaluate.component';
import { SectionQuestionsEvaluateComponent } from './elements/section-questions-evaluate/section-questions.-evaluate.component';
import { EvalQuestionComponent } from './eval-question/eval-question.component';
import { StaticEvaluateComponent } from './elements/static-evaluate/static-evaluate.component';
import { RadioEvaluateComponent } from './elements/radio-evaluate/radio-evaluate.component';
import { TextEvaluateComponent } from './elements/text-evaluate/text-evaluate.component';
import { FormsModule } from '@angular/forms';
import { FileUploadEvaluateComponent } from './elements/file-upload-evaluate/file-upload-evaluate.component';
import { FileUploadSessionModule } from 'file-upload-session';

@NgModule({
  declarations: [FormEvaluateComponent,
    MarksSummaryComponent,
    StudentSummaryComponent,
    SectionEvaluateComponent,
    SectionQuestionsEvaluateComponent,
    EvalQuestionComponent,
    StaticEvaluateComponent,
    RadioEvaluateComponent,
    TextEvaluateComponent,
    FileUploadEvaluateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MarkDisplayModule,
    FileUploadSessionModule
  ],
  exports: [FormEvaluateComponent]
})
export class EvaluateModule { }
