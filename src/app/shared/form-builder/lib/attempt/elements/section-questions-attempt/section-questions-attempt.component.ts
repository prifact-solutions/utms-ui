import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormElementType, SectionElement } from '../../../model/form-elements';
import { FormAttemptService } from '../../services/form-attempt.service';
import { Subscription } from 'rxjs';
import { QuestionPage } from '../../services/question-paper-pagination';
import { QuestionAnswer } from '../../../model/question-answer';


@Component({
  selector: 'app-section-questions-attempt',
  templateUrl: './section-questions-attempt.component.html',
  styleUrls: ['./section-questions-attempt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionQuestionsAttemptComponent implements OnInit {

  constructor(private formSvc: FormAttemptService) { }

  @Input() item: SectionElement
  containerids: Array<string> = []
  FormElementType = FormElementType
  questionNumbers: Object;
  private sub: Subscription;
  private sub2: Subscription;
  selectedPage: QuestionPage;
  questionAnswers: Object = {};

  ngOnInit(): void {

    this.sub = this.formSvc.qpContext.subscribe(res => {
      this.questionNumbers = res.questionNumbers;
    })

    this.sub2 = this.formSvc.selected_page.subscribe(pg => {
      this.selectedPage = pg;
    })
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }

    if(this.sub2) {
      this.sub2.unsubscribe();
    }
  }

  goToQuestion(questionName: string){
    let selectedQpPage = null;
    selectedQpPage = this.formSvc.pages.find(p => p.sections[0].questions.find(q => q.name == questionName));
    if(selectedQpPage){
      this.formSvc.selected_page.next(selectedQpPage);
    }
  }

  onAnswerChange(event: QuestionAnswer){
    setTimeout(() => {
      this.questionAnswers[event.name] = event.isAnswered;
      this.formSvc.notifyAnswerChanged(event);
    }, 0);
  }

}
