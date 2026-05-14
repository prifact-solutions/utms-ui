import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MCQAnswer } from '../../../model/context';
import { MCQElement } from '../../../model/form-elements';
import { FormAttemptService } from '../../services/form-attempt.service';
import { QuestionAnswerBaseComponent } from '../../../base-classes/question-answer-base-component';
import { QuestionAnswer } from '../../../model/question-answer';



@Component({
  selector: 'app-radio-attempt',
  templateUrl: './radio-attempt.component.html',
  styleUrls: ['./radio-attempt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RadioAttemptComponent extends QuestionAnswerBaseComponent implements OnInit {

  constructor(private formAttemptSvc: FormAttemptService) { 
    super();
  }

  @Input() item: MCQElement;
  @Input() isReadOnly: boolean;
  private emittedAnswer: boolean = false;

  get answer(): MCQAnswer {
    let ans = this.formAttemptSvc.getAnswerForQuestion(this.item);
    if (ans instanceof MCQAnswer){
      if(this.emittedAnswer != ans.isAnswered()){
        this.onSetAnswer.emit(new QuestionAnswer(ans));
        this.emittedAnswer = ans.isAnswered();
      }
      return ans;
    }

    throw new Error("Incorrect instance type - expected MCQAnswer - Found-> " + ans.elementType)
  }


  ngOnInit(): void {
  }

  onClear() {
    this.answer.answerChoiceValue = undefined;
  }
}
