import { Component, Input, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormEvaluateService } from '../services/form-evaluate.service';
import { FormElementTransientSettings, FormElementType } from '../../model/form-elements';
import { QuestionPaperEvaluateContext } from '../../model/context';
import { FormBuilderBackendService } from '../../services/form-builder-backend.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-form-evaluate',
  templateUrl: './form-evaluate.component.html',
  styleUrls: ['./form-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormEvaluateComponent implements OnInit {
  
  title = 'question-forms-evaluate';
  allFormElementTypes = FormElementTransientSettings.getAllFormElementTypes();
  @Input() attemptId: number;
  qpContext: QuestionPaperEvaluateContext;
  FormElementType = FormElementType;
  loading: boolean = true;
  @Output() marksSaved: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private formSvc: FormEvaluateService
    , private formBuilderBackendService: FormBuilderBackendService ) {

  }

  ngOnInit() {
    if(this.attemptId){
      this.formBuilderBackendService.getQuestionPaperEvalContext(this.attemptId.toString())
      .pipe(
        map(res => {
          return new QuestionPaperEvaluateContext(res);
        })
      )
      .subscribe(res => {
        this.loading = false;
        this.qpContext = res;
        this.formSvc.setQuestionPaperContext(this.qpContext)
      })
    }
    this.formSvc.qpContext.subscribe((newQp) => { if (newQp != null) this.qpContext = newQp });
  }

  onMarksCommit(event: boolean){
    let isEvalComplete = true;
    for (let i = 0; i < this.qpContext.answers.length; i++) {
      let ans = this.qpContext.answers[i];
      if (ans.isAnswered()) {
        let item = this.qpContext.evaluation.entries.find(e => e.question_name == ans.question_name);
        if (!item) {
          isEvalComplete = false;
          break;
        }
      }
    }
    
    this.formBuilderBackendService.saveEvalResults(this.qpContext.attempt_key, this.qpContext.evaluation, this.qpContext.marks_scored, isEvalComplete)
    .subscribe(_ => {
      this.marksSaved.emit(true);
    });
  }
}
