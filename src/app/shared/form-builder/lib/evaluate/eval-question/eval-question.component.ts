import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { EvalEntry } from '../../model/context';
import { FormElementType, QuestionElement } from '../../model/form-elements';
import { UtilsService } from '../../services/utils.service';
import { FormEvaluateService } from '../services/form-evaluate.service';


@Component({
  selector: 'app-eval-question',
  templateUrl: './eval-question.component.html',
  styleUrls: ['./eval-question.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EvalQuestionComponent implements OnInit {

  constructor(private formEvalSvc: FormEvaluateService) { }
  @Input()
  item: QuestionElement
  isEdit: boolean
  evalCommitted: EvalEntry
  evalCopy: EvalEntry
  step: number;
  errorMessage: string = null;

  ngOnInit(): void {
    this.evalCommitted = this.formEvalSvc.getEvalEntryFor(this.item);

    if (this.evalCommitted) {
      this.evalCopy = new EvalEntry(UtilsService.jsonCopy(this.evalCommitted));
    }
    else {
      this.evalCopy = new EvalEntry({ question_name: this.item.name });
    }

    if (this.evalCommitted != null) {
      //Show Readonly with existing data
      //Make button as Edit
      this.isEdit = false;
    }
    else {
      //Not evaluated
      //Show edit controls
      //Show apply
      this.isEdit = true;
    }

    if (this.item.elementType == FormElementType.multiple_choice) {
      this.step = this.item.marks;
    }
    else {
      this.step = 0.25;
    }

  }

  showError(msg) {
    this.errorMessage = msg;
    setTimeout(() => {
      this.errorMessage = null;
    }, 4000);
  }


  validate() {

    if (this.evalCopy.marks_awarded == null) {
      this.showError("Please enter the marks. Enter 0 if the answer is wrong");
      return false;
    }

    if (isNaN(this.evalCopy.marks_awarded) || this.evalCopy.marks_awarded < 0 || this.evalCopy.marks_awarded > this.item.marks) {
      this.showError("Invalid mark. Marks for this question should be in range - 0 and " + this.item.marks);
      return false;
    }

    if (this.item.elementType == FormElementType.multiple_choice) {
      if (this.evalCopy.marks_awarded != 0 && this.evalCopy.marks_awarded != this.item.marks) {
        this.showError("Invalid mark. Marks for this question should be 0 if incorrect or " + this.item.marks + " if correct");
        return false;
      }

    }
    return true;
  }

  onApply() {
    if (!this.validate())
      return

    this.evalCommitted = new EvalEntry(UtilsService.jsonCopy(this.evalCopy));

    if (!(this.item instanceof QuestionElement))
      throw new Error("Eval entry against non question!!!")

    this.formEvalSvc.setEvalEntryFor(this.item, this.evalCommitted);

    this.isEdit = false;
  }


  onCancel() {
    this.isEdit = false;
  }

  onEdit() {
    if (this.evalCommitted) {
      this.evalCopy = new EvalEntry(UtilsService.jsonCopy(this.evalCommitted));
    }
    else {
      this.evalCopy = new EvalEntry();
    }
    this.isEdit = true;
  }

}
