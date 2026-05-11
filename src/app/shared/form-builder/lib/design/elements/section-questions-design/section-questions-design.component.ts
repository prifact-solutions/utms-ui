import { CdkDrag, CdkDragDrop, CdkDragExit, CdkDropList, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormElement, FormElementTransientSettings, FormElementType, QuestionElement, SectionElement } from '../../../model/form-elements';
import { FormDesignerService } from '../../services/form-designer.service';

@Component({
  selector: 'app-section-questions-design',
  templateUrl: './section-questions-design.component.html',
  styleUrls: ['./section-questions-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionQuestionsDesignComponent implements OnInit {

  constructor(private formSvc: FormDesignerService) { }

  @Input()
  item: SectionElement

  containerids: Array<string> = []
  FormElementType = FormElementType
  selected_item_id_in_design_mode: string;
  showDelConfirm: boolean = false;
  selectedQuestion: QuestionElement;

  ngOnInit(): void {
    this.formSvc.containderids.subscribe((ids) => { if (ids != null) this.containerids = ids });
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

  removeField(question: QuestionElement) {
    this.selectedQuestion = question;
    document.getElementById('form-design').style.overflowY = "hidden";
    this.showDelConfirm = true;
  }

  delConfirmAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
    this.formSvc.removeElement(this.selectedQuestion.settings.uniqueId)
    if(this.selectedQuestion.isQuestion()){
      let currentTotalMarks: number = this.formSvc.total_marks.value;
      currentTotalMarks -= this.selectedQuestion.marks;
      this.formSvc.total_marks.next(currentTotalMarks); 
    }
    this.formSvc.reassignQuestionNames()
  }

  cancelDelAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
  }

  canDrop(drag: CdkDrag<FormElementTransientSettings | FormElement>, drop: CdkDropList) {
    //Drop can occuer from type list or from other question containers
    let retVal: boolean = this.formSvc.resolveDraggedElementType(drag) != FormElementType.section;

    return retVal
  }


  onDropExit(event: CdkDragExit) {
  }

  onDrop(event: CdkDragDrop<FormElement[], FormElementTransientSettings[] | FormElement[]>) {
    if (event.previousContainer === event.container) {
      //sorting items within a question container
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.formSvc.reassignQuestionNames();
      return;
    }

    if (event.previousContainer.data[0] instanceof FormElementTransientSettings)  //Note event.previousContainer.data[0] will be available
    {

      let from = <FormElementTransientSettings>event.previousContainer.data[event.previousIndex]
      let newQ = FormDesignerService.constructDefaultElement(from.elementType)

      event.container.data.splice(event.currentIndex, 0, newQ)

      if(newQ.isQuestion()){
        let currentTotalMarks: number = this.formSvc.total_marks.value;
        currentTotalMarks += 1;
        this.formSvc.total_marks.next(currentTotalMarks); 
      }

      //From RHS 
      //Add a default instance of a specific type
    }
    else if (event.previousContainer.data[0] instanceof FormElement) {
      //From another question container - just move as usual 
      transferArrayItem(<FormElement[]>event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    else {
      throw Error('Unexpected type');
    }

    this.formSvc.reassignQuestionNames();

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
