import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
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
  @Output() override onSetAnswer: EventEmitter<QuestionAnswer> = new EventEmitter<QuestionAnswer>();
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

  onAnswerChoiceChange(choiceValue: string | number) {
    const ans = this.answer;
    ans.answerChoiceValue = choiceValue;
    this.emitAnswerState(ans);
  }

  onClear() {
    const ans = this.answer;
    ans.answerChoiceValue = undefined;
    this.emitAnswerState(ans);
  }

  private emitAnswerState(answer: MCQAnswer) {
    const answerState = new QuestionAnswer(answer);
    this.emittedAnswer = answer.isAnswered();
    this.formAttemptSvc.notifyAnswerChanged(answerState);
    this.onSetAnswer.emit(answerState);
  }
}
