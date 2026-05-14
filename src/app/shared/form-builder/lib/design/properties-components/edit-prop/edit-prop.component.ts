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

  draftElement: FormElement | null = null;
  FormElementType = FormElementType;

  constructor(private formSvc: FormDesignerService) { }

  ngOnInit(): void {
    this.formSvc.editingDraft.subscribe((formElement) => {
      this.draftElement = formElement;
    });
  }

  getFormElementTypeLabel(elementType: FormElementType): string {
    return FormElementTransientSettings.getAllFormElementTypes().filter(x => x.elementType == elementType)[0].label
  }

}
