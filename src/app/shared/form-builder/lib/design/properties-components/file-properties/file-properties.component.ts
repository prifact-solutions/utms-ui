import { Component, OnInit, ViewEncapsulation, Input, SimpleChange } from '@angular/core';
import { FileUploadElement } from '../../../model/form-elements';
import { globalEditorConfig } from '../../../model/editor-configs';
import { FormDesignerService } from '../../services/form-designer.service';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-file-properties',
  templateUrl: './file-properties.component.html',
  styleUrls: ['./file-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilePropertiesComponent implements OnInit {

  constructor(private formSvc: FormDesignerService) { }

  @Input()
  item: FileUploadElement;
  globalEditorConfig = globalEditorConfig;
  initialMarks: number;

  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);

  ngOnInit() {
    this.noToolBarConfig.showToolbar = false;
  }

  ngOnChanges(changes: SimpleChange) {
    if (changes['item'].currentValue) {
      this.initialMarks = +changes['item'].currentValue.marks;
    }
  }

  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
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
