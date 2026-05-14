import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FileUploadAnswer } from '../../../model/context';
import { FormAttemptService } from '../../services/form-attempt.service';
import { FileUploadElement } from '../../../model/form-elements';
import { CreateSession } from '../../../model/create-session';
import { Session } from 'file-upload-session/lib/models/session';
import { Subscription } from 'rxjs';
import { QuestionAnswerBaseComponent } from '../../../base-classes/question-answer-base-component';
import { QuestionAnswer } from '../../../model/question-answer';

@Component({
  selector: 'app-file-upload-attempt',
  templateUrl: './file-upload-attempt.component.html',
  styleUrls: ['./file-upload-attempt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FileUploadAttemptComponent extends QuestionAnswerBaseComponent implements OnInit {

  constructor(private formAttemptSvc: FormAttemptService) {
    super();
   }

  @Input() item: FileUploadElement;
  @Input() isReadOnly: boolean;
  private emittedAnswer: boolean = false;

  get answer(): FileUploadAnswer {
    let ans = this.formAttemptSvc.getAnswerForQuestion(this.item);
    if (ans instanceof FileUploadAnswer){
      if(this.emittedAnswer != ans.isAnswered()){
        this.onSetAnswer.emit(new QuestionAnswer(ans));
        this.emittedAnswer = ans.isAnswered();
      }
      return ans;
    }

    throw new Error("Incorrect instance type - expected FileUpload Answer - Found-> " + ans.elementType)
  }

  sessionObj: CreateSession;
  private sub: Subscription;

  ngOnInit() {
    if (this.item) {
      this.sub = this.formAttemptSvc.qpContext.subscribe(res => {
        this.sessionObj = new CreateSession();
        this.sessionObj.attempt_id = +res.attemptkey;
        this.sessionObj.question_name = this.item.name;
        this.sessionObj.question_title = this.item.questionContent.value;
      })
    }
  }

  onSession(event: Session){
    this.answer.sessionKey = event.session_id;
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onFileCount(event: number) {
    if(event > 0){
      this.answer.hasAnswer = true;
    }
    else{
      this.answer.hasAnswer = false;
    }
  }
}
