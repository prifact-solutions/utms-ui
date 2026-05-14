import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { AngularEditorComponent, AngularEditorConfig } from '@kolkov/angular-editor';
import { globalEditorConfig } from '../../../model/editor-configs';
import { TextElement } from '../../../model/form-elements';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'app-text-properties',
  templateUrl: './text-properties.component.html',
  styleUrls: ['./text-properties.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextPropertiesComponent implements OnInit {

  constructor() { }
  @Input()
  item: TextElement;
  globalEditorConfig = globalEditorConfig;
  toolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);
  noToolBarConfig: AngularEditorConfig = UtilsService.jsonCopy(globalEditorConfig);

  ngOnInit(): void {
    this.noToolBarConfig.showToolbar = false;
  }
  onEditorFocus(editor: AngularEditorComponent) {
    editor.config = this.toolBarConfig;
  }

  onEditorBlur(editor: AngularEditorComponent) {
    editor.config = this.noToolBarConfig;
  }

}
