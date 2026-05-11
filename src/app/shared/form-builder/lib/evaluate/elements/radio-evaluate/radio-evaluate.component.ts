import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { FormEvaluateService } from '../../services/form-evaluate.service';
import { MCQElement } from '../../../model/form-elements';
import { MCQAnswer } from '../../../model/context';


@Component({
  selector: 'app-radio-evaluate',
  templateUrl: './radio-evaluate.component.html',
  styleUrls: ['./radio-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RadioEvaluateComponent implements OnInit {

  constructor(private formEvalSvc: FormEvaluateService) { }

  @Input()
  item: MCQElement;

  get answer(): MCQAnswer {

    let ans = this.formEvalSvc.getAnswerFor(this.item);

    if (ans == null)
      return null;

    if (ans instanceof MCQAnswer)
      return ans;

    throw new Error("Incorrect instance type - expected MCQAnswer - Found-> " + ans.elementType)
  }

  ngOnInit(): void {
  }
}
