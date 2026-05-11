import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { SectionElement } from '../../../model/form-elements';
import { FormEvaluateService } from '../../services/form-evaluate.service';


@Component({
  selector: 'app-section-evaluate',
  templateUrl: './section-evaluate.component.html',
  styleUrls: ['./section-evaluate.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SectionEvaluateComponent implements OnInit {

  @Input()
  item: SectionElement
  selected_item_id_in_evaluate_mode: string;

  constructor(private formSvc: FormEvaluateService) { }

  ngOnInit(): void {
    this.formSvc.selected_element.subscribe((fe) => { if (fe == null) this.selected_item_id_in_evaluate_mode = null; else this.selected_item_id_in_evaluate_mode = fe.settings.uniqueId });
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
