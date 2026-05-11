import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormDesignerService } from '../../services/form-designer.service';
import { SectionElement } from '../../../model/form-elements';

@Component({
  selector: 'app-section-design',
  templateUrl: './section-design.component.html',
  styleUrls: ['./section-design.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionDesignComponent implements OnInit {

  @Input()
  item: SectionElement
  selected_item_id_in_design_mode: string;
  showDelConfirm: boolean = false;
  confirmMessage: string;

  constructor(private formSvc: FormDesignerService) { }

  ngOnInit(): void {
    this.formSvc.selected_element.subscribe((fe) => { if (fe == null) this.selected_item_id_in_design_mode = null; else this.selected_item_id_in_design_mode = fe.settings.uniqueId });
  }

  removeField() {
    let hasItems = this.item.questions.length > 0
    this.confirmMessage = "Are you sure you want to remove this section?"
    if (hasItems) {
      this.confirmMessage += " Content/questions in this section will be removed as well"
    }
    document.getElementById('form-design').style.overflowY = "hidden";
    this.showDelConfirm = true;
  }

  delConfirmAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
    this.formSvc.removeElement(this.item.settings.uniqueId);
    if(this.item.questions.length > 0){
      let sectionMarks: number = 0;
      this.item.questions.forEach(q => {
        if(q.isQuestion()){
          sectionMarks += +q.marks;
        }
      });
      if(sectionMarks > 0){
        let diff = this.formSvc.total_marks.value - sectionMarks;
        this.formSvc.total_marks.next(diff);
      }
    }
  }

  cancelDelAction(event: boolean) {
    this.showDelConfirm = false;
    document.getElementById('form-design').style.overflowY = "visible";
  }

  onClickInside(event: Event) {
    this.formSvc.setSelectedElement(this.item);
  }

  onClickOutside(event) {
    /*
    if (this.formSvc.qpContext.designTimeSelectedElement == this.item)
    {
      console.log("Unselected section - " + this.item.settings.uniqueId)
      this.formSvc.qpContext.designTimeSelectedElement = null;
    }
    */
  }

}
