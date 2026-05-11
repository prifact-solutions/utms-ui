import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { StaticElement } from '../../../model/form-elements';
import { QuestionAnswerBaseComponent } from '../../../base-classes/question-answer-base-component';

@Component({
  selector: 'app-static-attempt',
  templateUrl: './static-attempt.component.html',
  styleUrls: ['./static-attempt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StaticAttemptComponent extends QuestionAnswerBaseComponent implements OnInit {

  constructor() {
    super();
  }

  @Input()
  item: StaticElement;

  ngOnInit(): void {
  }

}
