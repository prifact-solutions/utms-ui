import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormAttemptComponent } from './form-attempt/form-attempt.component';
import { RadioAttemptComponent } from './elements/radio-attempt/radio-attempt.component';
import { SectionQuestionsAttemptComponent } from './elements/section-questions-attempt/section-questions-attempt.component';
import { SectionAttemptComponent } from './elements/section-attempt/section-attempt.component';
import { StaticAttemptComponent } from './elements/static-attempt/static-attempt.component';
import { TextAttemptComponent } from './elements/text-attempt/text-attempt.component';
import { FormsModule } from '@angular/forms';
import { MarkDisplayModule } from '../components/mark-display/mark-display.module';
import { LibConfirmModule } from 'lib-confirm';
import { FileUploadSessionModule } from 'file-upload-session';
import { FileUploadAttemptComponent } from './elements/file-upload-attempt/file-upload-attempt.component';

@NgModule({
  declarations: [FormAttemptComponent,
    RadioAttemptComponent,
    SectionQuestionsAttemptComponent,
    SectionAttemptComponent,
    StaticAttemptComponent,
    TextAttemptComponent,
    FileUploadAttemptComponent],
  imports: [
    CommonModule,
    FormsModule,
    MarkDisplayModule,
    LibConfirmModule,
    FileUploadSessionModule
  ],
  exports: [FormAttemptComponent]
})
export class AttemptModule { }
