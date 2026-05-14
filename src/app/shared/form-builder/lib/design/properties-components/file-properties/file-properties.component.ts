import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { FileUploadElement } from '../../../model/form-elements';
import { globalEditorConfig } from '../../../model/editor-configs';
import { AngularEditorConfig, AngularEditorComponent } from '@kolkov/angular-editor';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-file-properties',
  templateUrl: './file-properties.component.html',
  styleUrls: ['./file-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FilePropertiesComponent implements OnInit {

  constructor() { }

  @Input()
  item: FileUploadElement;
  globalEditorConfig = globalEditorConfig;

  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);

  ngOnInit() {
    this.noToolBarConfig.showToolbar = false;
  }

  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
  }

}
