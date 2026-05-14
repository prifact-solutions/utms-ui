import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormElementType, QuestionElement, SectionElement } from '../../../model/form-elements';
import { FormEvaluateService } from '../../services/form-evaluate.service';

@Component({
  selector: 'app-section-questions-evaluate',
  templateUrl: './section-questions-evaluate.component.html',
  styleUrls: ['./section-questions-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionQuestionsEvaluateComponent implements OnInit {

  constructor(private formSvc: FormEvaluateService) { }

  @Input()
  item: SectionElement

  containerids: Array<string> = []
  FormElementType = FormElementType


  selected_item_id_in_design_mode: string;


  ngOnInit(): void {
    this.formSvc.selected_element.subscribe((fe) => { if (fe == null) this.selected_item_id_in_design_mode = null; else this.selected_item_id_in_design_mode = fe.settings.uniqueId });
  }


  getQuestionIndexSection(uniqueId): number {
    let i = 0;
    for (let q of this.item.questions) {
      if (q.settings.uniqueId == uniqueId) {
        return i;
      }

      if (q.isQuestion()) {
        i++;
      }
    }
    return -9999;
  }


  onClickInside(event: Event, question: QuestionElement) {
    this.formSvc.setSelectedElement(question);
  }

  onClickOutside(event, question: QuestionElement) {
    /*
    if (this.formSvc.qpContext.designTimeSelectedElement == question)
    {
      console.log("Unselected question - " + question.settings.uniqueId)
      this.formSvc.qpContext.designTimeSelectedElement = null;
    }
    */

  }


}
