import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormElement, FormElementTransientSettings, FormElementType } from '../../../model/form-elements';
import { FormDesignerService } from '../../services/form-designer.service';


@Component({
  selector: 'app-edit-prop',
  templateUrl: './edit-prop.component.html',
  styleUrls: ['./edit-prop.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditPropComponent implements OnInit {

  selected_form_element: FormElement;
  FormElementType = FormElementType;

  constructor(private formSvc: FormDesignerService) { }

  ngOnInit(): void {
    this.formSvc.selected_element.subscribe((formElement) => { this.selected_form_element = formElement });
  }

  getFormElementTypeLabel(elementType: FormElementType): string {
    return FormElementTransientSettings.getAllFormElementTypes().filter(x => x.elementType == elementType)[0].label
  }

}
