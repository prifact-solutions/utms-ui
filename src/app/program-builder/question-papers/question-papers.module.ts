import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateQuestionPaperComponent } from './components/create-question-paper/create-question-paper.component';
import { DesignQuestionPaperComponent } from './components/design-question-paper/design-question-paper.component';
import { QuestionPapersListComponent } from './components/question-papers-list/question-papers-list.component';
import { FormBuilderModule } from '../../shared/form-builder/form-builder.module';
import { FormBuilderBackendService } from '../../shared/form-builder/lib/services/form-builder-backend.service';
import { LibConfirmModule } from 'lib-confirm';
import { FormsModule } from '@angular/forms';
import { UtmsCommonModule } from 'src/app/common/common.module';
import { ExamBackendService } from 'src/app/shared/services/exam-backend.service';

@NgModule({
  declarations: [
    CreateQuestionPaperComponent,
    DesignQuestionPaperComponent,
    QuestionPapersListComponent,
  ],
  exports: [QuestionPapersListComponent],
  imports: [
    CommonModule,
    FormBuilderModule,
    LibConfirmModule,
    FormsModule,
    UtmsCommonModule,
  ],
  providers: [
    { provide: FormBuilderBackendService, useClass: ExamBackendService },
  ],
})
export class QuestionPapersModule {}
