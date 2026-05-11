import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TextAnswer } from '../../../model/context';
import { TextElement } from '../../../model/form-elements';
import { FormEvaluateService } from '../../services/form-evaluate.service';


@Component({
  selector: 'app-text-evaluate',
  templateUrl: './text-evaluate.component.html',
  styleUrls: ['./text-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextEvaluateComponent implements OnInit {

  constructor(private formEvalSvc: FormEvaluateService) { }
  @Input()
  item: TextElement;

  get answer(): TextAnswer {

    let ans = this.formEvalSvc.getAnswerFor(this.item);

    if (ans == null)
      return null;

    if (ans instanceof TextAnswer)
      return ans;

    throw new Error("Incorrect instance type - expected MCQAnswer - Found-> " + ans.elementType)
  }

  ngOnInit(): void {
  }

}
