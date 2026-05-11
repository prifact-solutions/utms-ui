import { Component, Input, OnInit, SimpleChange, ViewEncapsulation } from '@angular/core';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { globalEditorConfig } from '../../../model/editor-configs';
import { TextElement } from '../../../model/form-elements';
import { UtilsService } from '../../../services/utils.service';
import { FormDesignerService } from '../../services/form-designer.service';

@Component({
  selector: 'app-text-properties',
  templateUrl: './text-properties.component.html',
  styleUrls: ['./text-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextPropertiesComponent implements OnInit {

  constructor(private formSvc: FormDesignerService) { }
  @Input()
  item: TextElement;
  globalEditorConfig = globalEditorConfig;
  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  initialMarks: number;

  ngOnInit(): void {
    this.noToolBarConfig.showToolbar = false;
  }
  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
  }
  ngOnChanges(changes: SimpleChange) {
    if (changes['item'].currentValue) {
      this.initialMarks = +changes['item'].currentValue.marks;
    }
  }

  onMarksChange() {
    if (this.item.marks && !isNaN(this.item.marks) && this.item.marks > 0) {
      let diff: number;
      diff = this.item.marks - this.initialMarks;
      this.initialMarks = this.item.marks;
      let currentMarks: number = this.formSvc.total_marks.value + (diff);
      this.formSvc.total_marks.next(currentMarks);
    }
    else {
      let currentMarks: number = this.formSvc.total_marks.value - this.initialMarks;
      this.initialMarks = 0;
      this.formSvc.total_marks.next(currentMarks);
    }
  }

}
